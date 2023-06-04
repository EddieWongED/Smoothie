import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import type { Command } from "../../typings/structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import { client } from "../../index.js";

const actionOption: ApplicationCommandStringOption = {
    name: "action",
    type: ApplicationCommandOptionType.String,
    choices: [
        { name: "remove", value: "remove" },
        { name: "create", value: "create" },
        { name: "list", value: "list" },
    ],
    description: "Action to be performed",
    required: true,
};

const nameOption: ApplicationCommandStringOption = {
    name: "name",
    type: ApplicationCommandOptionType.String,
    description: "The name of the playlist to be removed / created / shown.",
    required: false,
};

export const playlistOptions: ApplicationCommandOptionData[] = [
    actionOption,
    nameOption,
];

export default new SmoothieCommand(Commands.playlist, {
    name: Commands.playlist,
    description: "Remove / Create / Show / List playlist.",
    options: playlistOptions,
    run: async ({ reply, guildData, guildStates, options, payload }) => {
        const { action, name } = options;
        if (!name) {
            options.name = "";
        }

        let command: Command | undefined;
        switch (action) {
            case "create": {
                command = client.commands.get(Commands.createPlaylist);
                break;
            }
            case "remove": {
                command = client.commands.get(Commands.removePlaylist);
                break;
            }
            case "list": {
                command = client.commands.get(Commands.listPlaylist);
                break;
            }
        }
        if (!command) return;
        await command.run({
            reply: reply,
            guildData: guildData,
            guildStates: guildStates,
            options: options,
            payload: payload,
        });
        return;
    },
});
