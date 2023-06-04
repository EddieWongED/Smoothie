import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

const nameOption: ApplicationCommandStringOption = {
    name: "name",
    type: ApplicationCommandOptionType.String,
    description: "The name of the playlist to be removed.",
    required: true,
};

export const removePlaylistOptions: ApplicationCommandOptionData[] = [
    nameOption,
];

export default new SmoothieCommand(Commands.removePlaylist, {
    name: Commands.removePlaylist,
    aliases: ["deleteplaylist"],
    description: "Remove a playlist.",
    options: removePlaylistOptions,
    run: async ({ options, reply, guildData }) => {
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

        // Remove playlist
        const filteredPlaylists = playlists.filter((playlist) => {
            return playlist.name !== name;
        });

        // Check if the playlist is removed
        if (filteredPlaylists.length === playlists.length) {
            await reply.error({
                title: "errorTitle",
                description: "removePlaylistFailedMessage",
                descriptionArgs: [name],
            });
            return;
        }

        // Update database
        await guildData.update("playlists", filteredPlaylists);

        await reply.success({
            title: "successTitle",
            description: "removePlaylistSuccessMessage",
            descriptionArgs: [name],
        });

        return;
    },
});
