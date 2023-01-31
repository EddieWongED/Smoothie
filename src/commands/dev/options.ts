import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import type {
    ApplicationCommandNumericOptionData,
    ApplicationCommandBooleanOptionData,
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommands } from "../../typings/structures/commands/SmoothieCommand.js";

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

const optionsOptions: ApplicationCommandOptionData[] = [
    numberOption,
    integerOption,
    stringOption,
    booleanOption,
];

export default new SmoothieCommand(SmoothieCommands.options, {
    name: SmoothieCommands.options,
    aliases: ["option", "o"],
    description: "Show all types of options.",
    options: optionsOptions,
    run: async ({ options, reply }) => {
        const { number, integer, string, boolean } = options;
        await reply.info("optionsNumberMessage", number.toString());
        await reply.infoFollowUp("optionsIntegerMessage", integer.toString());
        await reply.infoFollowUp("optionsStringMessage", string);
        await reply.infoFollowUp(
            "optionsBooleanMessage",
            boolean === undefined ? "Not Given" : String(boolean)
        );
        return;
    },
});
