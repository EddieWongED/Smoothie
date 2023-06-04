import type {
    ApplicationCommandChoicesOption,
    BaseApplicationCommandOptionsData,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { defaultLanguage } from "../../i18n/i18n.js";
import { client } from "../../index.js";
import type {
    CommandOptions,
    MessageCommandPayload,
    SlashCommandPayload,
} from "../../typings/structures/commands/SmoothieCommand.js";
import stringToBoolean from "../../utils/stringToBoolean.js";
import type GuildDataHandler from "../database/GuildDataHandler.js";
import ReplyHandler from "./ReplyHandler.js";
import Logging from "../logging/Logging.js";
import type GuildStatesHandler from "../database/GuildStatesHandler.js";

export class CommandHandler {
    async handleSlashCommand(
        interaction: SlashCommandPayload,
        guildData: GuildDataHandler,
        guildStates: GuildStatesHandler
    ) {
        try {
            // Create reply handler
            const language =
                (await guildData.get("language")) ?? defaultLanguage;
            const textChannelId =
                (await guildStates.get("textChannelId")) ?? null;
            const reply = new ReplyHandler(
                interaction,
                language,
                textChannelId
            );
            await reply.info({
                title: "loadingCommandTitle",
                description: "loadingCommandMessage",
                descriptionArgs: [interaction.commandName],
            });

            // Retrieve command
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            const data = interaction.options.data;

            // Parse command options
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: Record<string, any> = {};
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
                options: options as CommandOptions,
                guildData: guildData,
                guildStates: guildStates,
                reply: reply,
            });
        } catch (err) {
            Logging.error(err);
        }
    }

    async handleMessageCommand(
        message: MessageCommandPayload,
        guildData: GuildDataHandler,
        guildStates: GuildStatesHandler
    ) {
        try {
            // Parse and retrieve command
            const prefix = await guildData.get("prefix");
            if (!prefix) return;
            const data = message.content
                .trim()
                .slice(prefix.length)
                .replace(/  +/g, " ")
                .split(" ");
            const commandName = (data[0] ? data[0] : " ").toLowerCase();
            const args: string[] = data.length > 1 ? data.slice(1) : [];
            const command = client.commands.get(commandName);

            // Create reply handler
            const language =
                (await guildData.get("language")) ?? defaultLanguage;
            const textChannelId =
                (await guildStates.get("textChannelId")) ?? null;
            const reply = new ReplyHandler(message, language, textChannelId);
            await reply.info({
                title: "loadingCommandTitle",
                description: "loadingCommandMessage",
                descriptionArgs: [commandName],
            });

            if (!command) {
                await reply.error({
                    title: "errorTitle",
                    description: "noSuchCommandMessage",
                    descriptionArgs: [commandName],
                });
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
                await reply.error({
                    title: "errorTitle",
                    description: "tooFewInputMessage",
                    descriptionArgs: [fullCommandString],
                });
                return;
            }

            if (args.length > maxOptionsLength) {
                await reply.error({
                    title: "errorTitle",
                    description: "tooManyInputMessage",
                    descriptionArgs: [fullCommandString],
                });
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: Record<string, any> = {};
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
                            await reply.error({
                                title: "errorTitle",
                                description: "requireIntegerMessage",
                                descriptionArgs: [
                                    option.name,
                                    fullCommandString,
                                ],
                            });
                            return;
                        }

                        // If choices exist, check if the input matches the choices or not
                        if (choices) {
                            if (!(choices as number[]).includes(number)) {
                                await reply.error({
                                    title: "errorTitle",
                                    description: "noMatchChoiceMessage",
                                    descriptionArgs: [
                                        option.name,
                                        number.toString(),
                                        fullCommandString,
                                        choices
                                            .map((choice) => `\`${choice}\``)
                                            .join(", "),
                                    ],
                                });
                                return;
                            }
                        }
                        options[option.name] = number;
                        break;
                    }
                    case ApplicationCommandOptionType.Number: {
                        const number = Number(arg);
                        if (Number.isNaN(number)) {
                            await reply.error({
                                title: "errorTitle",
                                description: "requireNumberMessage",
                                descriptionArgs: [
                                    option.name,
                                    fullCommandString,
                                ],
                            });
                            return;
                        }

                        // If choices exist, check if the input matches the choices or not
                        if (choices) {
                            if (!(choices as number[]).includes(number)) {
                                await reply.error({
                                    title: "errorTitle",
                                    description: "noMatchChoiceMessage",
                                    descriptionArgs: [
                                        option.name,
                                        number.toString(),
                                        fullCommandString,
                                        choices
                                            .map((choice) => `\`${choice}\``)
                                            .join(", "),
                                    ],
                                });
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
                                await reply.error({
                                    title: "errorTitle",
                                    description: "noMatchChoiceMessage",
                                    descriptionArgs: [
                                        option.name,
                                        string,
                                        fullCommandString,
                                        choices
                                            .map((choice) => `\`${choice}\``)
                                            .join(", "),
                                    ],
                                });
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
                options: options as CommandOptions,
                guildData: guildData,
                guildStates: guildStates,
                reply: reply,
            });
        } catch (err) {
            Logging.error(err);
        }
    }
}
