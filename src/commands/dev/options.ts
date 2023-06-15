import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import type {
    ApplicationCommandNumericOptionData,
    ApplicationCommandBooleanOptionData,
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

const numberOption: ApplicationCommandNumericOptionData = {
    name: "number",
    type: ApplicationCommandOptionType.Number,
    choices: [
        { name: "one", value: 1 },
        { name: "two", value: 2 },
    ],
    description: "Number option.",
    required: true,
};

const integerOption: ApplicationCommandNumericOptionData = {
    name: "integer",
    type: ApplicationCommandOptionType.Integer,
    description: "Integer option.",
    required: true,
};

const stringOption: ApplicationCommandStringOption = {
    name: "string",
    type: ApplicationCommandOptionType.String,
    description: "String option.",
    required: true,
};

const booleanOption: ApplicationCommandBooleanOptionData = {
    name: "boolean",
    type: ApplicationCommandOptionType.Boolean,
    description: "Boolean option.",
    required: false,
};

export const optionsOptions: ApplicationCommandOptionData[] = [
    numberOption,
    integerOption,
    stringOption,
    booleanOption,
];

export default new SmoothieCommand(Commands.options, {
    name: Commands.options,
    aliases: ["option"],
    description: "Show all types of options.",
    options: optionsOptions,
    run: async ({ options, reply }) => {
        const { number, integer, string, boolean } = options;
        await reply.info({
            title: "optionsTitle",
            description: "optionsMessage",
            titleArgs: ["number"],
            descriptionArgs: [number.toString()],
        });
        await reply.infoFollowUp({
            title: "optionsTitle",
            description: "optionsMessage",
            titleArgs: ["integer"],
            descriptionArgs: [integer.toString()],
        });
        await reply.infoFollowUp({
            title: "optionsTitle",
            description: "optionsMessage",
            titleArgs: ["string"],
            descriptionArgs: [string],
        });
        await reply.infoFollowUp({
            title: "optionsTitle",
            description: "optionsMessage",
            titleArgs: ["boolean"],
            descriptionArgs: [
                boolean === undefined ? "Not Given" : String(boolean),
            ],
        });
        return;
    },
});
