import type { YouTubePlaylist } from "../../typings/structures/music/URLHandler.js";
import { URLType } from "../../typings/structures/music/URLHandler.js";
import ytdl from "ytdl-core";
import youtubeDl from "youtube-dl-exec";
import parseUrl from "parse-url";
import type { Song } from "../../data/music/Song.js";

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

    static async parse(url: string): Promise<Song[] | null> {
        const type = await this.validate(url);
        switch (type) {
            case URLType.invalid: {
                return null;
            }
            case URLType.single: {
                const result = await ytdl.getBasicInfo(url);
                const songs: Song[] = [
                    {
                        addedAt: new Date(),
                        playCount: 0,
                        title: result.videoDetails.title,
                        url: result.videoDetails.video_url,
                        duration: parseInt(result.videoDetails.lengthSeconds),
                    },
                ];
                return songs;
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
                if (!result) return null;

                const songs: Song[] = [];

                for (const video of result.entries) {
                    // If the video is privated, ignore it
                    if (!video.channel || !video.duration) continue;

                    songs.push({
                        addedAt: new Date(),
                        playCount: 0,
                        title: video.title,
                        url: video.url,
                        duration: video.duration,
                    });
                }
                return songs;
            }
            default: {
                return null;
            }
        }
    }
}
