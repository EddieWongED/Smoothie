import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

const prefixOption: ApplicationCommandStringOption = {
    name: "prefix",
    type: ApplicationCommandOptionType.String,
    description: getLocale(defaultLanguage, "prefixPrefixOptionDescription"),
    descriptionLocalizations: getLocalizationMap(
        "prefixPrefixOptionDescription"
    ),
    required: false,
};

export const prefixOptions: ApplicationCommandOptionData[] = [prefixOption];

export default new SmoothieCommand(Commands.prefix, {
    name: Commands.prefix,
    aliases: ["pre"],
    description: getLocale(defaultLanguage, "prefixDescription"),
    descriptionLocalizations: getLocalizationMap("prefixDescription"),
    options: prefixOptions,
    run: async ({ options, guildData, reply }) => {
        const { prefix } = options;

        // Show prefix
        if (!prefix) {
            const guildPrefix = await guildData.get("prefix");
            if (guildPrefix) {
                await reply.info({
                    title: "prefixShowSuccessTitle",
                    description: "prefixShowSuccessMessage",
                    descriptionArgs: [guildPrefix],
                });
            } else {
                await reply.error({
                    title: "errorTitle",
                    description: "prefixShowFailedMessage",
                });
            }
            return;
        }

        // Change prefix
        if (prefix.length < 1 || prefix.length > 3) {
            await reply.error({
                title: "errorTitle",
                description: "prefixLengthErrorMessage",
            });
            return;
        }

        const newGuildData = await guildData.update("prefix", prefix);
        if (!newGuildData) {
            await reply.error({
                title: "errorTitle",
                description: "prefixUpdateFailedMessage",
                descriptionArgs: [prefix],
            });
            return;
        }
        await reply.success({
            title: "successTitle",
            description: "prefixUpdateSuccessMessage",
            descriptionArgs: [newGuildData.prefix],
        });
        return;
    },
});
