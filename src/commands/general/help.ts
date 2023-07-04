import type {
    APIEmbedField,
    ApplicationCommandChoicesOption,
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
    BaseApplicationCommandOptionsData,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import type { Command } from "../../typings/structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import { client } from "../../index.js";
import BasicEmbed from "../../structures/embed/BasicEmbed.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { Emojis } from "../../typings/emoji/Emoji.js";
import didYouMean from "didyoumean";

// Cannot assign choices because there is a limit of 25 choices.
const commandOption: ApplicationCommandStringOption = {
    name: "command",
    type: ApplicationCommandOptionType.String,
    description: getLocale(defaultLanguage, "helpCommandOptionDescription"),
    descriptionLocalizations: getLocalizationMap(
        "helpCommandOptionDescription"
    ),
    required: false,
};

export const helpOptions: ApplicationCommandOptionData[] = [commandOption];

export default new SmoothieCommand(Commands.help, {
    name: Commands.help,
    description: getLocale(defaultLanguage, "helpDescription"),
    descriptionLocalizations: getLocalizationMap("helpDescription"),
    options: helpOptions,
    run: async ({ options, reply, guildData }) => {
        let { command } = options;

        const language = (await guildData.get("language")) ?? defaultLanguage;

        // Query which command does the user want to know more about
        if (!command) {
            const choice = await reply.options({
                title: "genericCommandTitle",
                titleArgs: [Commands.help],
                description: "helpMessage",
                emoji: Emojis.book,
                options: Object.values(Commands)
                    .reduce<Command[]>((commands, commandName) => {
                        const command = client.commands.get(commandName);
                        if (command) {
                            commands.push(command);
                        }
                        return commands;
                    }, [])
                    .map((command) => {
                        let description = command.description;
                        if (command.descriptionLocalizations) {
                            const localizedDescription =
                                command.descriptionLocalizations[language];
                            description = localizedDescription
                                ? localizedDescription
                                : description;
                        }
                        return {
                            label: command.name,
                            value: command.name,
                            description: description,
                        };
                    }),
            });
            if (!choice) return;

            command = choice as Commands;
        }

        const cmd = client.commands.get(command);
        if (!cmd) {
            didYouMean.threshold = 1;
            const mostSimilar = didYouMean(
                command,
                Array.from(client.commands.keys())
            ) as string | null;

            if (mostSimilar) {
                await reply.error({
                    title: "errorTitle",
                    description: "noSuchCommandWithSuggestionMessage",
                    descriptionArgs: [command, mostSimilar],
                });
            } else {
                await reply.error({
                    title: "errorTitle",
                    description: "noSuchCommandMessage",
                    descriptionArgs: [command],
                });
            }
            return;
        }

        const fields: APIEmbedField[] = [];

        // Add syntax
        const commandOptions = cmd.options ?? [];
        const prefix = (await guildData.get("prefix")) ?? "$";
        const syntax = `\`${prefix}${cmd.name} `
            .concat(
                commandOptions.map((option) => `<${option.name}>`).join(" ")
            )
            .trim()
            .concat("`");
        fields.push({
            name: getLocale(language, "syntaxField"),
            value: syntax,
            inline: true,
        });

        // Add aliases
        const aliases = cmd.aliases;
        if (aliases) {
            fields.push({
                name: getLocale(language, "aliasesField"),
                value: aliases.map((alias) => `\`${alias}\``).join(", "),
                inline: true,
            });
        }

        // Add options descriptions
        commandOptions.forEach((option) => {
            const op = option as BaseApplicationCommandOptionsData;
            let description = op.description;
            if (op.descriptionLocalizations) {
                const localizedDescription =
                    op.descriptionLocalizations[language];
                description = localizedDescription
                    ? localizedDescription
                    : description;
            }

            const choices = (
                option as ApplicationCommandChoicesOption
            ).choices?.map((data) => data.value);

            if (choices) {
                const possibleValueString = getLocale(
                    language,
                    "possibleValueDescription"
                );
                description = `${description}\n${possibleValueString}`.concat(
                    choices.map((data) => `\`${data.toString()}\``).join(", ")
                );
            }

            fields.push({
                name: `\`${op.name}\``.concat(op.required ? "*" : ""),
                value: description,
                inline: true,
            });
        });

        const titleString = getLocale(language, "genericCommandTitle", [
            cmd.name,
        ]);
        let description = cmd.description;
        if (cmd.descriptionLocalizations) {
            const localizedDescription = cmd.descriptionLocalizations[language];
            description = localizedDescription
                ? localizedDescription
                : description;
        }
        const embed = BasicEmbed.create({
            title: titleString,
            description: description,
            fields: fields,
            footer: getLocale(language, "requiredFieldFooter"),
            emoji: Emojis.book,
        });

        await reply.reply(embed);

        return;
    },
});
