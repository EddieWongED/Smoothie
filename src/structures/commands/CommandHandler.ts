import type {
    BaseApplicationCommandOptionsData,
    ChatInputCommandInteraction,
    Message,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { client } from "../../index.js";
import type { SmoothieCommandOptionsType } from "../../typings/structures/commands/SmoothieCommand.js";
import stringToBoolean from "../../utils/stringToBoolean.js";

export class CommandHandler {
    async handleSlashCommand(interaction: ChatInputCommandInteraction) {
        try {
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
                client: client,
                payload: interaction,
                options: options as SmoothieCommandOptionsType,
            });
        } catch (err) {
            console.error(err);
        }
    }

    async handleMessageCommand(message: Message) {
        try {
            const prefix = "$";
            const data = message.content
                .trim()
                .slice(prefix.length)
                .replace(/  +/g, " ")
                .split(" ");
            const commandName = data[0] ? data[0] : " ";
            const args: string[] = data.length > 1 ? data.slice(1) : [];
            const command = client.commands.get(commandName);

            if (!command) {
                await message.reply(`There is no \`${commandName}\` command.`);
                return;
            }

            const commandOptions = command.options ?? [];
            const maxOptionsLength = commandOptions.length;
            const minOptionsLength = commandOptions.filter((option) => {
                return (option as BaseApplicationCommandOptionsData).required;
            }).length;
            const optionNamesWithAngleBrackets = commandOptions.map(
                (option) => {
                    return (option as BaseApplicationCommandOptionsData)
                        .required
                        ? `<${option.name}>`
                        : `<${option.name} (optional)>`;
                }
            );

            if (args.length < minOptionsLength) {
                await message.reply(
                    `Too few input! (\`${prefix}${commandName} ${optionNamesWithAngleBrackets.join(
                        " "
                    )}\`)`
                );
                return;
            }

            if (args.length > maxOptionsLength) {
                await message.reply(
                    `Too many input! (\`${prefix}${commandName} ${optionNamesWithAngleBrackets.join(
                        " "
                    )}\`)`
                );
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: SmoothieCommandOptionsType | Record<string, any> =
                {};
            for (const [i, arg] of args.entries()) {
                const option = commandOptions[i];
                if (!option) return;
                switch (option.type) {
                    case ApplicationCommandOptionType.Integer: {
                        const number = Number(arg);
                        if (Number.isNaN(number) || !Number.isInteger(number)) {
                            await message.reply(
                                `\`${option.name}\` requires a integer. Please try again.`
                            );
                            return;
                        }
                        options[option.name] = number;
                        break;
                    }
                    case ApplicationCommandOptionType.Number: {
                        const number = Number(arg);
                        if (Number.isNaN(number)) {
                            await message.reply(
                                `\`${option.name}\` requires a number. Please try again.`
                            );
                            return;
                        }
                        options[option.name] = number;
                        break;
                    }
                    case ApplicationCommandOptionType.String: {
                        options[option.name] = arg;
                        break;
                    }
                    case ApplicationCommandOptionType.Boolean: {
                        options[option.name] = stringToBoolean(arg);
                        break;
                    }
                }
            }

            await command.run({
                client: client,
                payload: message,
                options: options as SmoothieCommandOptionsType,
            });
        } catch (err) {
            console.error(err);
        }
    }
}
