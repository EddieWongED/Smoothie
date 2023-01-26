import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import type {
    ApplicationCommandNumericOptionData,
    ApplicationCommandOptionData,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import type { PingOptions } from "../../typings/commands/general/PingOptions.js";

const numberOption: ApplicationCommandNumericOptionData = {
    name: "number",
    type: ApplicationCommandOptionType.Number,
    description: "Reply with your input.",
    required: true,
};

export const pingOptions: ApplicationCommandOptionData[] = [numberOption];

export default new SmoothieCommand({
    name: "ping",
    description: "Reply with pong!",
    options: pingOptions,
    run: async ({ interaction, options }) => {
        const { number } = options as PingOptions;
        await interaction.editReply("Pong!");
        await interaction.followUp(`You typed ${number}.`);
        return;
    },
});
