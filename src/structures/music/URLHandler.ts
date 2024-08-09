import type {
    ParseResult,
    YouTubePlaylist,
    YouTubeVideo,
    YoutubeBasicInfo,
} from "../../typings/structures/music/URLHandler.js";
import {
    URLType,
    URLHandlerError,
} from "../../typings/structures/music/URLHandler.js";
import youtubeDl from "youtube-dl-exec";
import parseUrl from "parse-url";
import type { Song } from "../../models/music/Song.js";
import { SongModel } from "../../models/music/Song.js";
import type { DocumentType } from "@typegoose/typegoose";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class URLHandler {
    static async getBasicInfo(url: string): Promise<YoutubeBasicInfo | null> {
        const { type, data } = await URLHandler._parse(url);
        if (type === URLType.single) {
            return data;
        }

        return null;
    }

    static async parseAndSave(
        url: string,
        guildId: string
    ): Promise<{ code: URLHandlerError; songs: DocumentType<Song>[] | null }> {
        const { type, data } = await this._parse(url);
        switch (type) {
            case URLType.invalid: {
                return {
                    code: URLHandlerError.invalidURL,
                    songs: null,
                };
            }
            case URLType.single: {
                const songs = await SongModel.upsertSongs(
                    guildId,
                    [
                        {
                            url: data.url,
                            title: data.title,
                            duration: data.duration,
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
                const songs = await SongModel.upsertSongs(
                    guildId,
                    data.map((song) => {
                        return {
                            url: song.url,
                            title: song.title,
                            duration: song.duration,
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

    private static async _parse(url: string): Promise<ParseResult> {
        // Check if the url is valid or not
        try {
            const parsedURL = parseUrl(url);
            if (
                (parsedURL.resource !== "www.youtube.com" &&
                    parsedURL.resource !== "music.youtube.com") ||
                (parsedURL.pathname !== "/watch" &&
                    parsedURL.pathname !== "/playlist")
            ) {
                return { type: URLType.invalid, data: null };
            }
        } catch (err) {
            return { type: URLType.invalid, data: null };
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
            })) as unknown as YouTubePlaylist | YouTubeVideo;

            if ("entries" in result) {
                return {
                    type: URLType.playlist,
                    data: result.entries.map((video) => {
                        return {
                            url: video.url,
                            title: video.title,
                            duration: video.duration ?? 0,
                            uploader: video.uploader,
                            uploaderURL: video.uploader_url,
                            thumbnailURL: video.thumbnails[0]?.url ?? null,
                        };
                    }),
                };
            } else {
                return {
                    type: URLType.single,
                    data: {
                        url: result.original_url,
                        title: result.title,
                        duration: result.duration ?? 0,
                        uploader: result.uploader,
                        uploaderURL: result.uploader_url,
                        thumbnailURL: result.thumbnails[0]?.url ?? null,
                    },
                };
            }
        } catch (err) {
            return { type: URLType.invalid, data: null };
        }
    }
}
