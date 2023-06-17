import arrayShuffle from "array-shuffle";
import type { Song } from "../../data/music/Song.js";
import type PlayOptions from "../../typings/commands/music/PlayOptions.js";
import GuildDataHandler from "../database/GuildDataHandler.js";
import GuildStatesHandler from "../database/GuildStatesHandler.js";
import stringSimilarity from "string-similarity";
import { Collection } from "discord.js";

export default class QueueHandler {
    guildData: GuildDataHandler;
    guildStates: GuildStatesHandler;

    constructor(public guildId: string) {
        this.guildData = new GuildDataHandler(guildId);
        this.guildStates = new GuildStatesHandler(guildId);
    }

    async first() {
        const queue = await this.fetch();
        if (!queue) return undefined;
        return queue[0];
    }

    async next() {
        const queue = await this.fetch();
        if (!queue) return undefined;
        const first = queue.shift();
        if (!first) return undefined;
        queue.push(first);
        await this.update(queue);
        return queue[0];
    }

    async add(songs: Song[], when: PlayOptions["when"] = "next") {
        // Skip the current song if now is chosen
        if (when === "now") {
            await this.next();
        }

        const queue = await this.fetch();
        if (!queue) return undefined;

        const filteredSongs = songs.filter((song) =>
            queue.every((queuedSong) => queuedSong.url !== song.url)
        );

        // Remove songs that are in newSongs from the queue
        const filteredQueue = queue.filter(
            (song) => !songs.some((newSong) => song.url === newSong.url)
        );

        const unionSongs = queue.filter((song) =>
            songs.some((newSong) => song.url === newSong.url)
        );

        const newSongs = songs.filter(
            (song) => !queue.some((newSong) => song.url === newSong.url)
        );

        songs = newSongs.concat(unionSongs);

        let newQueue: Song[];
        switch (when) {
            case "now": {
                newQueue = songs.concat(filteredQueue);
                break;
            }
            case "next": {
                newQueue = filteredQueue;
                newQueue.splice(1, 0, ...songs);
                break;
            }
            case "last": {
                newQueue = filteredQueue.concat(songs);
                break;
            }
        }

        if (!(await this.update(newQueue))) return undefined;

        return filteredSongs;
    }

    async fetch() {
        const playlists = await this.guildData.get("playlists");
        const name = await this.guildStates.get("currentPlaylistName");
        const playlist = playlists?.find((playlist) => playlist.name === name);
        if (!name || !playlists || !playlist) {
            return undefined;
        }
        return playlist.queue;
    }

    async update(queue: Song[]) {
        const playlists = await this.guildData.get("playlists");
        const name = await this.guildStates.get("currentPlaylistName");
        const playlist = playlists?.find((playlist) => playlist.name === name);
        if (!name || !playlists || !playlist) {
            return false;
        }
        playlist.queue = queue;

        await this.guildData.update("playlists", playlists);
        return true;
    }

    async remove(index: number) {
        const queue = await this.fetch();
        if (!queue || queue.length === 0 || index < 1 || index > queue.length) {
            return undefined;
        }
        const songToBeRemoved = queue[index - 1];
        if (!songToBeRemoved) return undefined;
        queue.splice(index - 1, 1);
        if (await this.update(queue)) {
            return songToBeRemoved;
        }
        return undefined;
    }

    async index(index: number) {
        const queue = await this.fetch();
        if (!queue || queue.length === 0 || index < 1 || index > queue.length) {
            return undefined;
        }
        return queue[index - 1];
    }

    async shuffle() {
        const queue = await this.fetch();
        if (!queue) return false;
        const first = queue.slice(0, 1);
        const rest = queue.slice(1);
        const shuffled = first.concat(arrayShuffle(rest));
        return await this.update(shuffled);
    }

    async search(query: string) {
        const queue = await this.fetch();
        if (!queue) return null;
        const similarityMap = new Collection<string, number>();
        queue.forEach((song, i) => {
            const titleSimilarity = stringSimilarity.compareTwoStrings(
                query.toLowerCase(),
                song.title.toLowerCase()
            );
            let uploaderSimilarity = 0;
            if (song.uploader) {
                uploaderSimilarity = stringSimilarity.compareTwoStrings(
                    query.toLowerCase(),
                    song.uploader.toLowerCase()
                );
            }

            const similarity = Math.max(titleSimilarity, uploaderSimilarity);
            similarityMap.set(`${i + 1}. ${song.title}`, similarity);
        });
        return similarityMap;
    }
}
