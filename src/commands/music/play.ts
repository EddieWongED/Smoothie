import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import URLHandler from "../../structures/music/URLHandler.js";

const urlOption: ApplicationCommandStringOption = {
    name: "url",
    type: ApplicationCommandOptionType.String,
    description: "The YouTube URL of the song.",
    required: true,
};

const whenOption: ApplicationCommandStringOption = {
    name: "when",
    type: ApplicationCommandOptionType.String,
    choices: [
        { name: "now", value: "now" },
        { name: "next", value: "next" },
        { name: "last", value: "last" },
    ],
    description: "When should the song be played.",
    required: false,
};

export const playOptions: ApplicationCommandOptionData[] = [
    urlOption,
    whenOption,
];

export default new SmoothieCommand(Commands.play, {
    name: Commands.play,
    description: "Play the song of the provided YouTube URL.",
    options: playOptions,
    run: async ({ reply, options, guildData, guildStates }) => {
        const { url } = options;
        let { when } = options;
        if (!when) {
            when = "next";
        }

        // Parse the URL
        const newSongs = await URLHandler.parse(url);
        if (!newSongs || newSongs.length === 0) {
            await reply.error({
                title: "errorTitle",
                description: "invalidYouTubeURLMessage",
            });
            return;
        }

        // Fetch the playlist
        const playlists = await guildData.get("playlists");
        const currentPlaylistName = await guildStates.get(
            "currentPlaylistName"
        );

        if (!playlists) {
            await reply.error({
                title: "errorTitle",
                description: "playFailedMessage",
                descriptionArgs: [url],
            });
            return;
        }

        if (!currentPlaylistName) {
            await reply.error({
                title: "errorTitle",
                description: "noPlaylistMessage",
            });
            return;
        }

        const playlist = playlists.find(
            (playlist) => playlist.name === currentPlaylistName
        );

        if (!playlist) {
            await reply.error({
                title: "errorTitle",
                description: "playFailedMessage",
                descriptionArgs: [url],
            });
            return;
        }

        // Filter songs that already have
        const filteredNewSongs = newSongs.filter((song) =>
            playlist.queue.every((queuedSong) => queuedSong.url !== song.url)
        );

        // Remove songs that are in newSongs from the queue
        const filteredQueue = playlist.queue.filter(
            (song) => !newSongs.some((newSong) => song.url === newSong.url)
        );

        switch (when) {
            case "now": {
                playlist.queue = newSongs.concat(filteredQueue);
                break;
            }
            case "next": {
                playlist.queue = filteredQueue;
                playlist.queue.splice(1, 0, ...newSongs);
                break;
            }
            case "last": {
                playlist.queue = filteredQueue.concat(newSongs);
                break;
            }
        }

        await guildData.update("playlists", playlists);

        await reply.success({
            title: "successTitle",
            description: "playSuccessMessage",
            descriptionArgs: [
                filteredNewSongs.length.toString(),
                (newSongs.length - filteredNewSongs.length).toString(),
            ],
        });

        return;
    },
});
