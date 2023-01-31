import type {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    InteractionResponse,
    Message,
    PermissionResolvable,
} from "discord.js";
import type ReplyHandler from "../../../structures/commands/ReplyHandler.js";
import type { OptionsOptions } from "../../commands/dev/OptionsOptions.js";
import type { LanguageOptions } from "../../commands/general/LanguageOptions.js";
import type GuildData from "../../models/GuildData.js";

export type SlashCommandPayload = ChatInputCommandInteraction & {
    payloadType: "slash";
};

export type MessageCommandPayload = Message & { payloadType: "message" };

export type SlashCommandResponse = InteractionResponse & {
    payloadType: "slash";
};

export type MessageCommandResponse = Message & { payloadType: "message" };

export type CommandPayloadType = SlashCommandPayload | MessageCommandPayload;

export type CommandReplyResponse =
    | SlashCommandResponse
    | MessageCommandResponse;

interface RunArguments<OptionsType> {
    payload: CommandPayloadType;
    options: OptionsType;
    guildData: GuildData;
    reply: ReplyHandler;
}

export type SmoothieCommandType<OptionsType> = {
    userPermission?: PermissionResolvable[];
    aliases?: string[];
    run: (args: RunArguments<OptionsType>) => Promise<void>;
} & ChatInputApplicationCommandData;

export type SmoothieCommandTypes =
    SmoothieCommandType<SmoothieCommandOptionsType>;

export type NoOptions = Record<string, never>;

// All data below need to update when adding a new command
export type SmoothieCommandOptionsType = OptionsOptions | LanguageOptions;

export enum SmoothieCommands {
    ping = "ping",
    options = "options",
    language = "language",
}

export interface SmoothieCommandList {
    [SmoothieCommands.ping]: [command: SmoothieCommandType<GetRootNodeOptions>];
    [SmoothieCommands.options]: [command: SmoothieCommandType<OptionsOptions>];
    [SmoothieCommands.language]: [
        command: SmoothieCommandType<LanguageOptions>
    ];
}
