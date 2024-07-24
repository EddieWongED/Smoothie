import type { YouTubePlaylist } from "../../typings/structures/music/URLHandler.js";
import { URLType } from "../../typings/structures/music/URLHandler.js";
import ytdl from "@distube/ytdl-core";
import youtubeDl from "youtube-dl-exec";
import parseUrl from "parse-url";
import type { Song } from "../../models/music/Song.js";
import { SongModel } from "../../models/music/Song.js";
import type { DocumentType } from "@typegoose/typegoose";
import Logging from "../logging/Logging.js";

export enum URLHandlerError {
    success,
    unknown,
    invalidURL,
    alreadyExists,
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class URLHandler {
    static async validate(url: string): Promise<URLType> {
        // Check if the url is valid or not
        try {
            const parsedURL = parseUrl(url);
            if (
                (parsedURL.resource !== "www.youtube.com" &&
                    parsedURL.resource !== "music.youtube.com") ||
                (parsedURL.pathname !== "/watch" &&
                    parsedURL.pathname !== "/playlist")
            ) {
                return URLType.invalid;
            }
        } catch (err) {
            return URLType.invalid;
        }

        // Check if it is single YouTube video
        try {
            await ytdl.getBasicInfo(url);
            return URLType.single;
        } catch (err) {
            /* empty */
        }

        // Check if it is a YouTube playist
        try {
            const result = (await youtubeDl(url, {
                flatPlaylist: true,
                dumpSingleJson: true,
                noWarnings: true,
                callHome: false,
                noCheckCertificates: true,
                preferFreeFormats: true,
                ignoreErrors: true,
                noColor: true,
                yesPlaylist: true,
                youtubeSkipDashManifest: true,
                geoBypass: true,
                simulate: true,
                skipDownload: true,
                skipUnavailableFragments: true,
                quiet: true,
            })) as unknown as YouTubePlaylist | undefined;
            if (!result) return URLType.invalid;
            return URLType.playlist;
        } catch (err) {
            return URLType.invalid;
        }
    }

    static async getBasicInfo(url: string) {
        try {
            const result = await ytdl.getBasicInfo(url);
            return {
                url: result.videoDetails.video_url,
                title: result.videoDetails.title,
                uploader: result.videoDetails.author.name,
                uploaderURL: result.videoDetails.author.channel_url,
                thumbnailURL: result.videoDetails.thumbnails[0]?.url ?? null,
                duration: parseInt(result.videoDetails.lengthSeconds),
            };
        } catch (err) {
            Logging.error(`Failed to get basic info of ${url}`);
            return null;
        }
    }

    static async parseAndSave(
        url: string,
        guildId: string
    ): Promise<{ code: URLHandlerError; songs: DocumentType<Song>[] | null }> {
        const type = await this.validate(url);
        switch (type) {
            case URLType.invalid: {
                return {
                    code: URLHandlerError.invalidURL,
                    songs: null,
                };
            }
            case URLType.single: {
                const info = await URLHandler.getBasicInfo(url);

                if (!info) {
                    return {
                        code: URLHandlerError.invalidURL,
                        songs: null,
                    };
                }

                const songs = await SongModel.upsertSongs(
                    guildId,
                    [
                        {
                            url: info.url,
                            title: info.title,
                            duration: info.duration,
                        },
                    ],
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    { _id: 1 }
                );

                return {
                    code: URLHandlerError.success,
                    songs: songs,
                };
            }
            case URLType.playlist: {
                const result = (await youtubeDl(url, {
                    ignoreErrors: true,
                    flatPlaylist: true,
                    dumpSingleJson: true,
                    noWarnings: true,
                    callHome: false,
                    noCheckCertificates: true,
                    preferFreeFormats: true,
                    noColor: true,
                    yesPlaylist: true,
                    youtubeSkipDashManifest: true,
                    geoBypass: true,
                    simulate: true,
                    skipDownload: true,
                    skipUnavailableFragments: true,
                    quiet: true,
                })) as unknown as YouTubePlaylist | undefined;
                if (!result) {
                    return {
                        code: URLHandlerError.invalidURL,
                        songs: null,
                    };
                }

                const songs = await SongModel.upsertSongs(
                    guildId,
                    result.entries.map((video) => {
                        return {
                            url: video.url,
                            title: video.title,
                            duration: video.duration ?? 0,
                        };
                    }),
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    { _id: 1 }
                );

                return {
                    code: URLHandlerError.success,
                    songs: songs,
                };
            }
            default: {
                return {
                    code: URLHandlerError.unknown,
                    songs: null,
                };
            }
        }
    }
}
