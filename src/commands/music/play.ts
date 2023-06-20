import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import URLHandler from "../../structures/music/URLHandler.js";
import QueueHandler from "../../structures/music/QueueHandler.js";
import { client } from "../../index.js";

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
    run: async ({ guildId, reply, options, guildStates }) => {
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

        // Create queue handler
        const queueHandler = new QueueHandler(guildId);

        // Fetch the name of the current playlist
        const currentPlaylistName = await guildStates.get(
            "currentPlaylistName"
        );

        if (!currentPlaylistName) {
            await reply.error({
                title: "errorTitle",
                description: "noPlaylistMessage",
            });
            return;
        }

        const addedSongs = await queueHandler.add(newSongs, when);
        if (!addedSongs) {
            await reply.error({
                title: "errorTitle",
                description: "playFailedMessage",
            });
            return;
        }

        if (newSongs.length === 1 && addedSongs.length === 1) {
            // Single
            const song = addedSongs[0];
            if (!song) {
                await reply.error({
                    title: "errorTitle",
                    description: "playFailedMessage",
                });
                return;
            }
            await reply.success({
                title: "successTitle",
                description: "playSingleSuccessMessage",
                descriptionArgs: [song.title],
            });
        } else {
            // Playlist
            await reply.success({
                title: "successTitle",
                description: "playPlaylistSuccessMessage",
                descriptionArgs: [
                    addedSongs.length.toString(),
                    (newSongs.length - addedSongs.length).toString(),
                ],
            });
        }

        // Play song if no song is playing
        const player = client.audioPlayers.get(guildId);
        if (player) {
            if (when === "now") {
                await player.playFirst();
            } else {
                await player.start();
            }
        }

        return;
    },
});
