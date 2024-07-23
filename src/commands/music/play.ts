import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import URLHandler, {
    URLHandlerError,
} from "../../structures/music/URLHandler.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";
import { StatesModel } from "../../models/guild/States.js";
import { client } from "../../index.js";

const urlOption: ApplicationCommandStringOption = {
    name: "url",
    type: ApplicationCommandOptionType.String,
    description: getLocale(defaultLanguage, "playURLOptionDescription"),
    descriptionLocalizations: getLocalizationMap("playURLOptionDescription"),
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
    description: getLocale(defaultLanguage, "playWhenOptionDescription"),
    descriptionLocalizations: getLocalizationMap("playWhenOptionDescription"),
    required: false,
};

export const playOptions: ApplicationCommandOptionData[] = [
    urlOption,
    whenOption,
];

export default new SmoothieCommand(Commands.play, {
    name: Commands.play,
    description: getLocale(defaultLanguage, "playDescription"),
    descriptionLocalizations: getLocalizationMap("playDescription"),
    options: playOptions,
    run: async ({ guildId, reply, options }) => {
        const { url } = options;
        let { when } = options;
        if (!when) {
            when = "next";
        }

        // Parse the URL
        const { code, songs } = await URLHandler.parseAndSave(url, guildId);

        if (code === URLHandlerError.invalidURL || !songs) {
            await reply.error({
                title: "errorTitle",
                description: "invalidYouTubeURLMessage",
            });
            return;
        }

        const playlist = await StatesModel.findCurrentPlaylist(guildId);

        if (!playlist) {
            await reply.error({
                title: "errorTitle",
                description: "noPlaylistMessage",
            });
            return;
        }

        const numSongAdded = await playlist.addSong(songs, when);

        if (numSongAdded === 0) {
            await reply.error({
                title: "errorTitle",
                description: "playFailedMessage",
                descriptionArgs: [url],
            });
            return;
        }

        switch (when) {
            case "now": {
                await reply.success({
                    title: "successTitle",
                    description: "playNowSuccessMessage",
                    descriptionArgs: [numSongAdded.toString()],
                });
                break;
            }
            case "next": {
                await reply.success({
                    title: "successTitle",
                    description: "playNextSuccessMessage",
                    descriptionArgs: [numSongAdded.toString()],
                });
                break;
            }
            case "last": {
                await reply.success({
                    title: "successTitle",
                    description: "playLastSuccessMessage",
                    descriptionArgs: [numSongAdded.toString()],
                });
                break;
            }
        }

        // // Play song if no song is playing
        const player = client.audioPlayers.get(guildId);
        if (player) {
            if (when === "now") {
                await player.playNext();
            } else {
                await player.start();
            }
        }

        return;
    },
});
