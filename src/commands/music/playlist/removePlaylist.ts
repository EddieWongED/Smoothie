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

        const playlistsGenerator = guildData.getThenUpdate("playlists");
        const playlists = (await playlistsGenerator.next()).value;
        if (!playlists) {
            await playlistsGenerator.throw(
                new Error("Failed to remove playlist.")
            );
            await reply.error({
                title: "errorTitle",
                description: "removePlaylistFailedMessage",
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
            await playlistsGenerator.throw(
                new Error("Playlist does not exist.")
            );
            await reply.error({
                title: "errorTitle",
                description: "playlistDoesNotExistMessage",
                descriptionArgs: [name],
            });
            return;
        }

        // Remove playlist
        const filteredPlaylists = playlists.filter((playlist) => {
            return playlist.name !== name;
        });

        // Check if the playlist is removed
        if (filteredPlaylists.length === playlists.length) {
            await playlistsGenerator.throw(
                new Error("Failed to remove playlist.")
            );
            await reply.error({
                title: "errorTitle",
                description: "removePlaylistFailedMessage",
                descriptionArgs: [name],
            });
            return;
        }

        // Update database
        await playlistsGenerator.next(filteredPlaylists);

        const firstPlaylistName = filteredPlaylists[0]?.name;

        if (!firstPlaylistName) {
            await guildStates.update("currentPlaylistName", null);
        } else {
            // Update currentPlaylistName if the name of the playlist being removed is currentPlaylistName
            const currentPlaylistNameGenerator = guildStates.getThenUpdate(
                "currentPlaylistName"
            );

            const currentPlaylistName = (
                await currentPlaylistNameGenerator.next()
            ).value;

            if (!currentPlaylistName || currentPlaylistName === name) {
                await currentPlaylistNameGenerator.next(firstPlaylistName);

                // Switch song
                const player = client.audioPlayers.get(guildId);
                if (player) {
                    player.forceStop();
                    await player.playFirst();
                }

                await reply.infoFollowUp({
                    title: "autoSwitchPlaylistTitle",
                    description: "autoSwitchPlaylistMessage",
                    titleArgs: [firstPlaylistName],
                    descriptionArgs: [firstPlaylistName],
                    willEdit: false,
                });
            } else {
                await currentPlaylistNameGenerator.throw(
                    new Error("No need to change currentPlaylistName")
                );
            }
        }

        await reply.success({
            title: "successTitle",
            description: "removePlaylistSuccessMessage",
            descriptionArgs: [name],
        });

        return;
    },
});
