import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { SmoothieCommands } from "../../typings/structures/commands/SmoothieCommand.js";
import type {
    ApplicationCommandOptionChoiceData,
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Languages } from "../../typings/i18n/i18n.js";

const languageOption: ApplicationCommandStringOption = {
    name: "language",
    choices: Object.values(Languages).map((language) => {
        return {
            name: language,
            value: language,
        } as ApplicationCommandOptionChoiceData<string>;
    }),
    type: ApplicationCommandOptionType.String,
    description: "The language code.",
    required: false,
};

export const languageOptions: ApplicationCommandOptionData[] = [languageOption];

export default new SmoothieCommand(SmoothieCommands.language, {
    name: SmoothieCommands.language,
    aliases: ["lang"],
    description: "Change language.",
    options: languageOptions,
    run: async ({ options, guildData, reply }) => {
        const { language } = options;

        // Show language
        if (!language) {
            const guildLanguage = await guildData.get("language");
            if (guildLanguage) {
                await reply.info("languageShowMessageSuccess", guildLanguage);
            } else {
                await reply.error("languageShowMessageFailed");
            }
            return;
        }

        // Change language
        const newGuildData = await guildData.update("language", language);
        if (!newGuildData) {
            await reply.error("languageUpdateMessageFailed", language);
            return;
        }
        await reply.info("languageUpdateMessageSuccess", newGuildData.language);
        return;
    },
});
