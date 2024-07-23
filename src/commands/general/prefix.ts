import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";
import { ConfigsModel } from "../../models/guild/Configs.js";

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
    run: async ({ options, guildId, reply }) => {
        const { prefix } = options;

        // Show prefix
        if (!prefix) {
            const configs = await ConfigsModel.findByGuildId(guildId);
            const guildPrefix = configs?.prefix;
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

        await ConfigsModel.findAndSetPrefix(guildId, prefix);
        await reply.success({
            title: "successTitle",
            description: "prefixUpdateSuccessMessage",
            descriptionArgs: [prefix],
        });
        return;
    },
});
