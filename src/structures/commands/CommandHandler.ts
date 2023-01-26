import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { client } from "../../index.js";
import type { SmoothieCommandOptionsType } from "../../typings/structures/commands/SmoothieCommand.js";

export class CommandHandler {
    async handleSlashCommand(interaction: CommandInteraction) {
        try {
            await interaction.deferReply();
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            const data = interaction.options.data;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: SmoothieCommandOptionsType | Record<string, any> =
                {};
            for (const option of data) {
                switch (option.type) {
                    case ApplicationCommandOptionType.Integer:
                    case ApplicationCommandOptionType.Number: {
                        options[option.name] = option.value as number;

                        break;
                    }
                    case ApplicationCommandOptionType.String: {
                        options[option.name] = option.value as string;

                        break;
                    }
                    case ApplicationCommandOptionType.Boolean: {
                        options[option.name] = option.value as boolean;
                        break;
                    }
                }
            }

            await command.run({
                options: options as SmoothieCommandOptionsType,
                client,
                interaction,
            });
        } catch (err) {
            console.error(err);
        }
    }
}
