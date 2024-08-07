import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import type {
    ApplicationCommandOptionChoiceData,
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Languages } from "../../typings/i18n/i18n.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";
import { ConfigsModel } from "../../models/guild/Configs.js";

const languageOption: ApplicationCommandStringOption = {
    name: "language",
    choices: Object.values(Languages).map((language) => {
        return {
            name: language,
            value: language,
        } as ApplicationCommandOptionChoiceData<string>;
    }),
    type: ApplicationCommandOptionType.String,
    description: getLocale(
        defaultLanguage,
        "languageLanguageOptionDescription"
    ),
    descriptionLocalizations: getLocalizationMap(
        "languageLanguageOptionDescription"
    ),
    required: false,
};

export const languageOptions: ApplicationCommandOptionData[] = [languageOption];

export default new SmoothieCommand(Commands.language, {
    name: Commands.language,
    aliases: ["lang"],
    description: getLocale(defaultLanguage, "languageDescription"),
    descriptionLocalizations: getLocalizationMap("languageDescription"),
    options: languageOptions,
    run: async ({ options, guildId, reply }) => {
        const { language } = options;

        // Show language
        if (!language) {
            const configs = await ConfigsModel.findByGuildId(guildId);
            const guildLanguage = configs?.language;

            if (guildLanguage) {
                await reply.info({
                    title: "languageShowSuccessTitle",
                    description: "languageShowSuccessMessage",
                    descriptionArgs: [guildLanguage],
                });
            } else {
                await reply.error({
                    title: "errorTitle",
                    description: "languageShowFailedMessage",
                });
            }
            return;
        }

        // Change language
        await ConfigsModel.findAndSetLanguage(guildId, language);

        await reply.success({
            title: "successTitle",
            description: "languageUpdateSuccessMessage",
            descriptionArgs: [language],
        });
        return;
    },
});
