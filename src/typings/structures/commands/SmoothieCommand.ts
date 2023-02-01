import type {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    InteractionResponse,
    Message,
    PermissionResolvable,
} from "discord.js";
import type ReplyHandler from "../../../structures/commands/ReplyHandler.js";
import type GuildDataHandler from "../../../structures/database/GuildDataHandler.js";
import type OptionsOptions from "../../commands/dev/OptionsOptions.js";
import type LanguageOptions from "../../commands/general/LanguageOptions.js";
import type PingOptions from "../../commands/general/PingOptions.js";
import type PrefixOptions from "../../commands/general/PrefixOptions.js";
import type JoinOptions from "../../commands/music/JoinOptions.js";
import type LeaveOptions from "../../commands/music/LeaveOptions.js";

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
    guildData: GuildDataHandler;
    reply: ReplyHandler;
}

export type SmoothieCommandType<OptionsType> = {
    userPermission?: PermissionResolvable[];
    aliases?: string[];
    run: (args: RunArguments<OptionsType>) => Promise<void> | void;
} & ChatInputApplicationCommandData;

export type SmoothieCommandTypes =
    SmoothieCommandType<SmoothieCommandOptionsType>;

export type NoOptions = Record<string, never>;

// All data below need to update when adding a new command
export type SmoothieCommandOptionsType =
    | PingOptions
    | OptionsOptions
    | LanguageOptions
    | PrefixOptions
    | JoinOptions
    | LeaveOptions;

export enum SmoothieCommands {
    ping = "ping",
    options = "options",
    language = "language",
    prefix = "prefix",
    join = "join",
    leave = "leave",
}

export interface SmoothieCommandList {
    [SmoothieCommands.ping]: [command: SmoothieCommandType<PingOptions>];
    [SmoothieCommands.options]: [command: SmoothieCommandType<OptionsOptions>];
    [SmoothieCommands.language]: [
        command: SmoothieCommandType<LanguageOptions>
    ];
    [SmoothieCommands.prefix]: [command: SmoothieCommandType<PrefixOptions>];
    [SmoothieCommands.join]: [command: SmoothieCommandType<JoinOptions>];
    [SmoothieCommands.leave]: [command: SmoothieCommandType<LeaveOptions>];
}
