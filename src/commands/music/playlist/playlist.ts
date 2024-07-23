import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../../structures/commands/SmoothieCommand.js";
import type { Command } from "../../../typings/structures/commands/SmoothieCommand.js";
import { Commands } from "../../../typings/structures/commands/SmoothieCommand.js";
import { client } from "../../../index.js";
import { defaultLanguage, getLocale } from "../../../i18n/i18n.js";
import getLocalizationMap from "../../../utils/getLocalizationMap.js";

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
    description: getLocale(defaultLanguage, "playlistActionOptionDescription"),
    descriptionLocalizations: getLocalizationMap(
        "playlistActionOptionDescription"
    ),
    required: true,
};

const nameOption: ApplicationCommandStringOption = {
    name: "name",
    type: ApplicationCommandOptionType.String,
    description: getLocale(defaultLanguage, "playlistNameOptionDescription"),
    descriptionLocalizations: getLocalizationMap(
        "playlistNameOptionDescription"
    ),
    required: false,
};

export const playlistOptions: ApplicationCommandOptionData[] = [
    actionOption,
    nameOption,
];

export default new SmoothieCommand(Commands.playlist, {
    name: Commands.playlist,
    description: getLocale(defaultLanguage, "playlistDescription"),
    descriptionLocalizations: getLocalizationMap("playlistDescription"),
    options: playlistOptions,
    run: async ({ guildId, reply, options, payload }) => {
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
            options: options,
            payload: payload,
        });
        return;
    },
});
