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

    async prev() {
        const queueGenerator = this.fetchThenUpdate();
        const queue = (await queueGenerator.next()).value;

        if (!queue) {
            await queueGenerator.throw("Queue not found.");
            return undefined;
        }
        const last = queue.pop();
        if (!last) {
            await queueGenerator.throw("Not Song in queue.");
            return undefined;
        }

        queue.unshift(last);
        await queueGenerator.next(queue);
        return queue[0];
    }

    async next() {
        const queueGenerator = this.fetchThenUpdate();
        const queue = (await queueGenerator.next()).value;

        if (!queue) {
            await queueGenerator.throw("Queue not found.");
            return undefined;
        }
        const first = queue.shift();
        if (!first) {
            await queueGenerator.throw("Not Song in queue.");
            return undefined;
        }

        queue.push(first);
        await queueGenerator.next(queue);
        return queue[0];
    }

    async add(songs: Song[], when: PlayOptions["when"] = "next") {
        // Skip the current song if now is chosen
        if (when === "now") {
            await this.next();
        }

        const queueGenerator = this.fetchThenUpdate();
        const queue = (await queueGenerator.next()).value;
        if (!queue) {
            await queueGenerator.throw("Queue not found.");
            return undefined;
        }

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

        await queueGenerator.next(newQueue);

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

    async *fetchThenUpdate() {
        const playlistsGenerator = this.guildData.getThenUpdate("playlists");
        const playlists = (await playlistsGenerator.next()).value;
        const name = await this.guildStates.get("currentPlaylistName");
        const playlist = playlists?.find((playlist) => playlist.name === name);

        if (!name || !playlists || !playlist) {
            await playlistsGenerator.throw("Playlist not found.");
            return;
        }

        let newData: typeof playlist.queue | null = null;
        try {
            newData = (yield playlist.queue) as typeof playlist.queue | null;
        } catch (err) {
            if (err instanceof Error) {
                await playlistsGenerator.throw(err.message);
            }
        }

        if (!newData) {
            await playlistsGenerator.throw("Queue is null");
            return;
        }

        playlist.queue = newData;

        await playlistsGenerator.next(playlists);
        return;
    }

    async remove(index: number) {
        const queueGenerator = this.fetchThenUpdate();
        const queue = (await queueGenerator.next()).value;

        if (!queue || queue.length === 0 || index < 1 || index > queue.length) {
            await queueGenerator.throw("Queue remove out of index.");
            return undefined;
        }
        const songToBeRemoved = queue[index - 1];
        if (!songToBeRemoved) {
            await queueGenerator.throw("Song to be removed not found.");
            return undefined;
        }
        queue.splice(index - 1, 1);

        await queueGenerator.next(queue);

        return songToBeRemoved;
    }

    async index(index: number) {
        const queue = await this.fetch();
        if (!queue || queue.length === 0 || index < 1 || index > queue.length) {
            return undefined;
        }
        return queue[index - 1];
    }

    async shuffle() {
        const queueGenerator = this.fetchThenUpdate();
        const queue = (await queueGenerator.next()).value;

        if (!queue) {
            await queueGenerator.throw("Queue not found.");
            return false;
        }

        const first = queue.slice(0, 1);
        const rest = queue.slice(1);
        const shuffled = first.concat(arrayShuffle(rest));

        await queueGenerator.next(shuffled);
        return true;
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
