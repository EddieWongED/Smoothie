import type {
    ApplicationCommandChoicesOption,
    BaseApplicationCommandOptionsData,
    CommandInteractionOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { client } from "../../index.js";
import type {
    MessageCommandPayload,
    SlashCommandPayload,
} from "../../typings/structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import stringToBoolean from "../../utils/stringToBoolean.js";
import GuildDataHandler from "../database/GuildDataHandler.js";
import ReplyHandler from "./ReplyHandler.js";
import Logging from "../logging/Logging.js";
import GuildStatesHandler from "../database/GuildStatesHandler.js";
import type HelpOptions from "../../typings/commands/general/HelpOptions.js";
import didYouMean from "didyoumean";
import { Emojis } from "../../typings/emoji/Emoji.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CommandHandler {
    static async handleSlashCommand(interaction: SlashCommandPayload) {
        const guildId = interaction.guildId;
        if (!guildId) return;

        const guildData = new GuildDataHandler(guildId);
        const guildStates = new GuildStatesHandler(guildId);

        const commandName = interaction.commandName;
        // Create reply handler
        const reply = new ReplyHandler({
            payload: interaction,
            guildId: guildId,
        });

        // Loading Embed
        await reply.info({
            title: "loadingCommandTitle",
            description: "loadingCommandMessage",
            descriptionArgs: [commandName],
            emoji: Emojis.loading,
        });

        // Retrieve command
        const command = client.commands.get(commandName);
        if (!command) {
            didYouMean.threshold = 1;
            const mostSimilar = didYouMean(
                commandName,
                Array.from(client.commands.keys())
            ) as string | null;

            if (mostSimilar) {
                await reply.error({
                    title: "errorTitle",
                    description: "noSuchCommandWithSuggestionMessage",
                    descriptionArgs: [commandName, mostSimilar],
                });
            } else {
                await reply.error({
                    title: "errorTitle",
                    description: "noSuchCommandMessage",
                    descriptionArgs: [commandName],
                });
            }
            return;
        }
        const data = interaction.options.data;

        // Parse command options
        const options: Record<string, CommandInteractionOption["value"]> = {};
        for (const option of data) {
            switch (option.type) {
                case ApplicationCommandOptionType.Integer:
                case ApplicationCommandOptionType.Number:
                case ApplicationCommandOptionType.String:
                case ApplicationCommandOptionType.Boolean: {
                    options[option.name] = option.value;
                    break;
                }
            }
        }

        try {
            await command.run({
                guildId: guildId,
                payload: interaction,
                options: options,
                guildData: guildData,
                guildStates: guildStates,
                reply: reply,
            });
        } catch (err) {
            Logging.error(`Failed to run the command ${commandName}`);
            Logging.error(err);
        }
    }

    static async handleMessageCommand(message: MessageCommandPayload) {
        try {
            const guildId = message.guildId;
            if (!guildId) return;

            const guildData = new GuildDataHandler(guildId);
            const guildStates = new GuildStatesHandler(guildId);

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
            const reply = new ReplyHandler({
                payload: message,
                guildId: guildId,
            });

            // Loading Embed
            await reply.info({
                title: "loadingCommandTitle",
                description: "loadingCommandMessage",
                descriptionArgs: [commandName],
                emoji: Emojis.loading,
            });

            // Retrieve command
            if (!command) {
                didYouMean.threshold = 1;
                const mostSimilar = didYouMean(
                    commandName,
                    Array.from(client.commands.keys())
                ) as string | null;

                if (mostSimilar) {
                    await reply.error({
                        title: "errorTitle",
                        description: "noSuchCommandWithSuggestionMessage",
                        descriptionArgs: [commandName, mostSimilar],
                    });
                } else {
                    await reply.error({
                        title: "errorTitle",
                        description: "noSuchCommandMessage",
                        descriptionArgs: [commandName],
                    });
                }
                return;
            }

            // Parse command options
            const commandOptions = command.options;
            const options: Record<string, CommandInteractionOption["value"]> =
                {};

            // Parse options if it exists
            if (commandOptions) {
                const maxOptionsLength = commandOptions.length;
                const minOptionsLength = commandOptions.filter((option) => {
                    return (option as BaseApplicationCommandOptionsData)
                        .required;
                }).length;

                // Check if there are too few options
                if (args.length < minOptionsLength) {
                    await reply.error({
                        title: "errorTitle",
                        description: "tooFewInputMessage",
                    });
                    await CommandHandler._sendHelpCommand({
                        payload: message,
                        guildId: guildId,
                        command: commandName,
                    });
                    return;
                }

                // Check if there are too many options
                if (args.length > maxOptionsLength) {
                    await reply.error({
                        title: "errorTitle",
                        description: "tooManyInputMessage",
                    });
                    await CommandHandler._sendHelpCommand({
                        payload: message,
                        guildId: guildId,
                        command: commandName,
                    });
                    return;
                }

                // Parse options
                for (const [i, arg] of args.entries()) {
                    const option = commandOptions[i];
                    if (!option) return;

                    // Perform type checking and parse input into its type
                    let input: CommandInteractionOption["value"];
                    switch (option.type) {
                        case ApplicationCommandOptionType.Integer: {
                            if (!Number.isInteger(Number(arg))) {
                                await reply.error({
                                    title: "errorTitle",
                                    description: "requireIntegerMessage",
                                    descriptionArgs: [option.name],
                                });
                                await CommandHandler._sendHelpCommand({
                                    payload: message,
                                    guildId: guildId,
                                    command: commandName,
                                });
                                return;
                            }
                            input = parseInt(arg);
                            break;
                        }
                        case ApplicationCommandOptionType.Number: {
                            if (Number.isNaN(arg)) {
                                await reply.error({
                                    title: "errorTitle",
                                    description: "requireNumberMessage",
                                    descriptionArgs: [option.name],
                                });
                                await CommandHandler._sendHelpCommand({
                                    payload: message,
                                    guildId: guildId,
                                    command: commandName,
                                });
                                return;
                            }
                            input = Number(arg);
                            break;
                        }
                        case ApplicationCommandOptionType.String: {
                            input = arg;
                            break;
                        }
                        case ApplicationCommandOptionType.Boolean: {
                            input = stringToBoolean(arg);
                            break;
                        }
                    }

                    if (input === undefined) return;

                    // Check if there is choices in this input
                    const choices = (
                        commandOptions[i] as ApplicationCommandChoicesOption
                    ).choices?.map((data) => data.value);

                    // If choices exist, check if the input matches the choices or not
                    if (
                        choices &&
                        typeof input !== "boolean" &&
                        !choices.includes(input)
                    ) {
                        await reply.error({
                            title: "errorTitle",
                            description: "noMatchChoiceMessage",
                            descriptionArgs: [input.toString(), option.name],
                        });
                        await CommandHandler._sendHelpCommand({
                            payload: message,
                            guildId: guildId,
                            command: commandName,
                        });
                        return;
                    }

                    options[option.name] = input;
                }
            }

            await command.run({
                guildId: guildId,
                payload: message,
                options: options,
                guildData: guildData,
                guildStates: guildStates,
                reply: reply,
            });
        } catch (err) {
            Logging.error(err);
        }
    }

    private static async _sendHelpCommand({
        payload,
        guildId,
        command,
    }: {
        payload: MessageCommandPayload;
        guildId: string;
        command: string;
    }) {
        const guildData = new GuildDataHandler(guildId);
        const guildStates = new GuildStatesHandler(guildId);

        const helpCommand = client.commands.get(Commands.help);
        if (!helpCommand) return;
        await helpCommand.run({
            guildId: guildId,
            reply: new ReplyHandler({ guildId: guildId }),
            guildData: guildData,
            guildStates: guildStates,
            options: { command: command } as HelpOptions,
            payload: payload,
        });
    }
}
