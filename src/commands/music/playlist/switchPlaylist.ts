import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../../typings/structures/commands/SmoothieCommand.js";
import { client } from "../../../index.js";
import { defaultLanguage, getLocale } from "../../../i18n/i18n.js";
import getLocalizationMap from "../../../utils/getLocalizationMap.js";

const nameOption: ApplicationCommandStringOption = {
    name: "name",
    type: ApplicationCommandOptionType.String,
    description: getLocale(
        defaultLanguage,
        "switchPlaylistNameOptionDescription"
    ),
    descriptionLocalizations: getLocalizationMap(
        "switchPlaylistNameOptionDescription"
    ),
    required: true,
};

export const switchPlaylistOptions: ApplicationCommandOptionData[] = [
    nameOption,
];

export default new SmoothieCommand(Commands.switchPlaylist, {
    name: Commands.switchPlaylist,
    description: getLocale(defaultLanguage, "switchPlaylistDescription"),
    descriptionLocalizations: getLocalizationMap("switchPlaylistDescription"),
    options: switchPlaylistOptions,
    run: async ({ guildId, options, reply, guildData, guildStates }) => {
        const { name } = options;
        // Check if name is empty or not
        if (name.length === 0) {
            await reply.error({
                title: "errorTitle",
                description: "playlistNameNotEmptyMessage",
            });
            return;
        }

        const playlists = await guildData.get("playlists");
        if (!playlists) {
            await reply.error({
                title: "errorTitle",
                description: "switchPlaylistFailedMessage",
                descriptionArgs: [name],
            });
            return;
        }

        // Check if the playlist exists
        if (
            playlists.every((playlist) => {
                return playlist.name !== name;
            })
        ) {
            await reply.error({
                title: "errorTitle",
                description: "playlistDoesNotExistMessage",
                descriptionArgs: [name],
            });
            return;
        }

        // Update database
        const newStates = await guildStates.update("currentPlaylistName", name);

        if (newStates && newStates.currentPlaylistName === name) {
            await reply.success({
                title: "successTitle",
                description: "switchPlaylistSuccessMessage",
                descriptionArgs: [name],
            });
        } else {
            await reply.error({
                title: "errorTitle",
                description: "switchPlaylistFailedMessage",
                descriptionArgs: [name],
            });
            return;
        }

        // Switch song
        const player = client.audioPlayers.get(guildId);
        if (player) {
            player.forceStop();
            await player.playFirst();
        }

        return;
    },
});
