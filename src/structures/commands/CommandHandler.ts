import type {
    ApplicationCommandChoicesOption,
    BaseApplicationCommandOptionsData,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { defaultLanguage } from "../../i18n/i18n.js";
import { client } from "../../index.js";
import type {
    MessageCommandPayload,
    SlashCommandPayload,
    SmoothieCommandOptionsType,
} from "../../typings/structures/commands/SmoothieCommand.js";
import stringToBoolean from "../../utils/stringToBoolean.js";
import GuildDataHandler from "../database/GuildDataHandler.js";
import ReplyHandler from "./ReplyHandler.js";

export class CommandHandler {
    async handleSlashCommand(interaction: SlashCommandPayload) {
        try {
            // Fetch guild data
            const guildId = interaction.guildId;
            if (!guildId) return;
            const guildData = new GuildDataHandler(guildId);
            const language =
                (await guildData.get("language")) ?? defaultLanguage;

            // Create reply handler
            const reply = new ReplyHandler(interaction, language);
            await reply.info("loadingCommandMessage", interaction.commandName);

            // Retrieve command
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            const data = interaction.options.data;

            // Parse command options
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
                payload: interaction,
                options: options as SmoothieCommandOptionsType,
                guildData: guildData,
                reply: reply,
            });
        } catch (err) {
            console.error(err);
        }
    }

    async handleMessageCommand(message: MessageCommandPayload) {
        try {
            // Fetch guild data
            const guildId = message.guildId;
            if (!guildId) return;
            const guildData = new GuildDataHandler(guildId);
            const language =
                (await guildData.get("language")) ?? defaultLanguage;

            // Parse and retrieve command
            const prefix = await guildData.get("prefix");
            if (!prefix) return;
            const data = message.content
                .trim()
                .slice(prefix.length)
                .replace(/  +/g, " ")
                .split(" ");
            const commandName = data[0] ? data[0] : " ";
            const args: string[] = data.length > 1 ? data.slice(1) : [];
            const command = client.commands.get(commandName);

            // Create reply handler
            const reply = new ReplyHandler(message, language);
            await reply.info("loadingCommandMessage", commandName);

            if (!command) {
                await reply.error("noSuchCommandMessage", commandName);
                return;
            }

            // Parse command options
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

            let fullCommandString = `\`${prefix}${commandName} ${optionNamesWithAngleBrackets.join(
                " "
            )}\``;
            if (commandOptions.length == 0) {
                fullCommandString = `\`${prefix}${commandName}\``;
            }

            if (args.length < minOptionsLength) {
                await reply.error("tooFewInputMessage", fullCommandString);
                return;
            }

            if (args.length > maxOptionsLength) {
                await reply.error("tooManyInputMessage", fullCommandString);
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: SmoothieCommandOptionsType | Record<string, any> =
                {};
            for (const [i, arg] of args.entries()) {
                const option = commandOptions[i];
                if (!option) return;

                // Check if there is choices in this input
                let choices: (string | number)[] | undefined;
                if (command.options) {
                    const commandChoices = (
                        command.options[i] as ApplicationCommandChoicesOption
                    ).choices;
                    if (commandChoices) {
                        choices = commandChoices.map((data) => data.value);
                    }
                }

                switch (option.type) {
                    case ApplicationCommandOptionType.Integer: {
                        const number = Number(arg);
                        if (Number.isNaN(number) || !Number.isInteger(number)) {
                            await reply.error(
                                "requireIntegerMessage",
                                option.name,
                                fullCommandString
                            );
                            return;
                        }

                        // If choices exist, check if the input matches the choices or not
                        if (choices) {
                            if (!(choices as number[]).includes(number)) {
                                await reply.error(
                                    "noMatchChoiceMessage",
                                    option.name,
                                    number.toString(),
                                    fullCommandString,
                                    choices
                                        .map((choice) => `\`${choice}\``)
                                        .join(", ")
                                );
                                return;
                            }
                        }
                        options[option.name] = number;
                        break;
                    }
                    case ApplicationCommandOptionType.Number: {
                        const number = Number(arg);
                        if (Number.isNaN(number)) {
                            await reply.error(
                                "requireNumberMessage",
                                option.name,
                                fullCommandString
                            );
                            return;
                        }

                        // If choices exist, check if the input matches the choices or not
                        if (choices) {
                            if (!(choices as number[]).includes(number)) {
                                await reply.error(
                                    "noMatchChoiceMessage",
                                    option.name,
                                    number.toString(),
                                    fullCommandString,
                                    choices
                                        .map((choice) => `\`${choice}\``)
                                        .join(", ")
                                );
                                return;
                            }
                        }
                        options[option.name] = number;
                        break;
                    }
                    case ApplicationCommandOptionType.String: {
                        const string = arg;

                        // If choices exist, check if the input matches the choices or not
                        if (choices) {
                            if (!(choices as string[]).includes(string)) {
                                await reply.error(
                                    "noMatchChoiceMessage",
                                    option.name,
                                    string,
                                    fullCommandString,
                                    choices
                                        .map((choice) => `\`${choice}\``)
                                        .join(", ")
                                );
                                return;
                            }
                        }
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
                payload: message,
                options: options as SmoothieCommandOptionsType,
                guildData: guildData,
                reply: reply,
            });
        } catch (err) {
            console.error(err);
        }
    }
}
