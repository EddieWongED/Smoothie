import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import type {
    ApplicationCommandNumericOptionData,
    ApplicationCommandOptionData,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommands } from "../../typings/structures/commands/SmoothieCommand.js";
import { getLocale } from "../../i18n/i18n.js";

const numberOption: ApplicationCommandNumericOptionData = {
    name: "number",
    type: ApplicationCommandOptionType.Number,
    description: "Reply with your input.",
    required: true,
};

export const pingOptions: ApplicationCommandOptionData[] = [numberOption];

export default new SmoothieCommand(SmoothieCommands.ping, {
    name: SmoothieCommands.ping,
    description: "Reply with pong!",
    options: pingOptions,
    run: async ({ payload, options, guildData }) => {
        const { number } = options;
        await payload.reply(
            getLocale(guildData.language, "pingMessage", number.toString())
        );
        return;
    },
});
