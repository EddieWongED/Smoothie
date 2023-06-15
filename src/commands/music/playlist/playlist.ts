import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../../structures/commands/SmoothieCommand.js";
import type { Command } from "../../../typings/structures/commands/SmoothieCommand.js";
import { Commands } from "../../../typings/structures/commands/SmoothieCommand.js";
import { client } from "../../../index.js";

const actionOption: ApplicationCommandStringOption = {
    name: "action",
    type: ApplicationCommandOptionType.String,
    choices: [
        { name: "remove", value: "remove" },
        { name: "create", value: "create" },
        { name: "info", value: "info" },
        { name: "switch", value: "switch" },
        { name: "list", value: "list" },
    ],
    description: "Action to be performed.",
    required: true,
};

const nameOption: ApplicationCommandStringOption = {
    name: "name",
    type: ApplicationCommandOptionType.String,
    description:
        "The name of the playlist to be removed / created / shown / switched to.",
    required: false,
};

export const playlistOptions: ApplicationCommandOptionData[] = [
    actionOption,
    nameOption,
];

export default new SmoothieCommand(Commands.playlist, {
    name: Commands.playlist,
    description: "Remove / Create / Show / Switch to / List / playlist.",
    options: playlistOptions,
    run: async ({
        guildId,
        reply,
        guildData,
        guildStates,
        options,
        payload,
    }) => {
        const { action, name } = options;
        if (!name) {
            options.name = "";
        }

        let command: Command | undefined;
        switch (action) {
            case "remove": {
                command = client.commands.get(Commands.removePlaylist);
                break;
            }
            case "create": {
                command = client.commands.get(Commands.createPlaylist);
                break;
            }
            case "info": {
                command = client.commands.get(Commands.infoPlaylist);
                break;
            }
            case "switch": {
                command = client.commands.get(Commands.switchPlaylist);
                break;
            }
            case "list": {
                command = client.commands.get(Commands.listPlaylist);
                break;
            }
        }
        if (!command) return;
        await command.run({
            guildId: guildId,
            reply: reply,
            guildData: guildData,
            guildStates: guildStates,
            options: options,
            payload: payload,
        });
        return;
    },
});
