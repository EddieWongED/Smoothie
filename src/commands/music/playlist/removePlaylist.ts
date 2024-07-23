import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../../typings/structures/commands/SmoothieCommand.js";
import { defaultLanguage, getLocale } from "../../../i18n/i18n.js";
import getLocalizationMap from "../../../utils/getLocalizationMap.js";
import { client } from "../../../index.js";
import { PlaylistModel } from "../../../models/music/Playlist.js";
import { StatesModel } from "../../../models/guild/States.js";

const nameOption: ApplicationCommandStringOption = {
    name: "name",
    type: ApplicationCommandOptionType.String,
    description: getLocale(
        defaultLanguage,
        "removePlaylistNameOptionDescription"
    ),
    descriptionLocalizations: getLocalizationMap(
        "removePlaylistNameOptionDescription"
    ),
    required: true,
};

export const removePlaylistOptions: ApplicationCommandOptionData[] = [
    nameOption,
];

export default new SmoothieCommand(Commands.removePlaylist, {
    name: Commands.removePlaylist,
    aliases: ["deleteplaylist"],
    description: getLocale(defaultLanguage, "removePlaylistDescription"),
    descriptionLocalizations: getLocalizationMap("removePlaylistDescription"),
    options: removePlaylistOptions,
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
        if (!playlist) {
            await reply.error({
                title: "errorTitle",
                description: "playlistDoesNotExistMessage",
                descriptionArgs: [name],
            });
            return;
        }

        // Confirm removing the playlist
        if (
            !(await reply.confirm({
                title: "confirmTitle",
                description: "confirmRemovePlaylistMessage",
                descriptionArgs: [name],
            }))
        ) {
            await reply.success({
                title: "cancelSuccessTitle",
                description: "cancelRemovePlaylistSuccessMessage",
                descriptionArgs: [name],
            });
            return;
        }

        const result = await PlaylistModel.deleteOne({
            guildId: guildId,
            name: name,
        });

        if (!result.acknowledged || result.deletedCount === 0) {
            await reply.error({
                title: "errorTitle",
                description: "removePlaylistFailedMessage",
                descriptionArgs: [name],
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "removePlaylistSuccessMessage",
            descriptionArgs: [name],
        });

        // Auto switch to first existing playlist
        const currentPlaylist = await StatesModel.findCurrentPlaylist(guildId);

        if (currentPlaylist === null || currentPlaylist.name === name) {
            const playlists = await PlaylistModel.findAllByGuildId(guildId);
            const newPlaylist = playlists[0] ?? null;
            await StatesModel.findAndSetCurrentPlaylist(
                guildId,
                newPlaylist ?? null
            );

            if (newPlaylist) {
                await reply.infoFollowUp({
                    title: "autoSwitchPlaylistTitle",
                    description: "autoSwitchPlaylistMessage",
                    titleArgs: [newPlaylist.name],
                    descriptionArgs: [newPlaylist.name],
                    willEdit: false,
                });
            }
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
