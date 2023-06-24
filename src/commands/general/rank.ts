import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import type { Command } from "../../typings/structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { client } from "../../index.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

const actionOption: ApplicationCommandStringOption = {
    name: "action",
    type: ApplicationCommandOptionType.String,
    choices: [
        { name: "stay", value: "stay" },
        { name: "queue", value: "queue" },
    ],
    description: getLocale(defaultLanguage, "rankActionOptionDescription"),
    descriptionLocalizations: getLocalizationMap("rankActionOptionDescription"),
    required: true,
};

export const rankOptions: ApplicationCommandOptionData[] = [actionOption];

export default new SmoothieCommand(Commands.rank, {
    name: Commands.rank,
    aliases: ["ranking"],
    description: getLocale(defaultLanguage, "rankDescription"),
    descriptionLocalizations: getLocalizationMap("rankDescription"),
    options: rankOptions,
    run: async ({
        guildId,
        reply,
        guildData,
        guildStates,
        options,
        payload,
    }) => {
        const { action } = options;

        let command: Command | undefined;
        switch (action) {
            case "stay": {
                command = client.commands.get(Commands.stayRank);
                break;
            }
            case "queue": {
                command = client.commands.get(Commands.queueRank);
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
