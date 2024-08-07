import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../../typings/structures/commands/SmoothieCommand.js";
import { defaultLanguage, getLocale } from "../../../i18n/i18n.js";
import getLocalizationMap from "../../../utils/getLocalizationMap.js";
import { StatesModel } from "../../../models/guild/States.js";
import { PlaylistModel } from "../../../models/music/Playlist.js";
import { client } from "../../../index.js";

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
    run: async ({ guildId, options, reply }) => {
        const { name } = options;
        // Check if name is empty or not
        if (name.length === 0) {
            await reply.error({
                title: "errorTitle",
                description: "playlistNameNotEmptyMessage",
            });
            return;
        }

        const playlist = await PlaylistModel.findByGuildIdAndName(
            guildId,
            name
        );

        if (playlist === null) {
            await reply.error({
                title: "errorTitle",
                description: "playlistDoesNotExistMessage",
                descriptionArgs: [name],
            });
            return;
        }

        const newStates = await StatesModel.findAndSetCurrentPlaylist(
            guildId,
            playlist
        );

        if (newStates.currentPlaylist?._id.equals(playlist._id)) {
            await reply.success({
                title: "successTitle",
                description: "switchPlaylistSuccessMessage",
                descriptionArgs: [name],
            });

            // Switch song
            const player = client.audioPlayers.get(guildId);
            if (player) {
                player.forceStop();
                await player.playFirst();
            }
            return;
        }

        await reply.error({
            title: "errorTitle",
            description: "switchPlaylistFailedMessage",
            descriptionArgs: [name],
        });
        return;
    },
});
