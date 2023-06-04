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
    description: "The name of the playlist.",
    required: true,
};

export const createPlaylistOptions: ApplicationCommandOptionData[] = [
    nameOption,
];

export default new SmoothieCommand(Commands.createPlaylist, {
    name: Commands.createPlaylist,
    aliases: ["addplaylist"],
    description: "Create a new playlist.",
    options: createPlaylistOptions,
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
                description: "createPlaylistFailedMessage",
                descriptionArgs: [name],
            });
            return;
        }

        // Check if the playlist already exists
        if (
            !playlists.every((playlist) => {
                return playlist.name !== name;
            })
        ) {
            await reply.error({
                title: "errorTitle",
                description: "playlistAlreadyExistMessage",
                descriptionArgs: [name],
            });
            return;
        }

        // Update database
        playlists.push({
            name: name,
            queue: [],
            createdAt: new Date(),
        });
        await guildData.update("playlists", playlists);

        await reply.success({
            title: "successTitle",
            description: "createPlaylistSuccessMessage",
            descriptionArgs: [name],
        });

        return;
    },
});
