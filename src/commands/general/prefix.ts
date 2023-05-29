import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";

const prefixOption: ApplicationCommandStringOption = {
    name: "prefix",
    type: ApplicationCommandOptionType.String,
    description: "Change command prefix.",
    required: false,
};

export const prefixOptions: ApplicationCommandOptionData[] = [prefixOption];

export default new SmoothieCommand(Commands.prefix, {
    name: Commands.prefix,
    aliases: ["pre"],
    description: "Show / Change prefix.",
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
