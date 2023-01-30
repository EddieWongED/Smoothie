import type {
    ChatInputApplicationCommandData,
    CommandInteraction,
    Message,
    PermissionResolvable,
} from "discord.js";
import type { OptionsOptions } from "../../commands/dev/OptionsOptions.js";
import type { LanguageOptions } from "../../commands/general/LanguageOptions.js";
import type { PingOptions } from "../../commands/general/PingOptions.js";
import type GuildData from "../../models/GuildData.js";

interface RunArguments<OptionsType> {
    payload: CommandInteraction | Message;
    options: OptionsType;
    guildData: GuildData;
}

export type SmoothieCommandType<OptionsType> = {
    userPermission?: PermissionResolvable[];
    aliases?: string[];
    run: (args: RunArguments<OptionsType>) => Promise<void>;
} & ChatInputApplicationCommandData;

export type SmoothieCommandTypes =
    SmoothieCommandType<SmoothieCommandOptionsType>;

// All data below need to update when adding a new command
export type SmoothieCommandOptionsType =
    | OptionsOptions
    | PingOptions
    | LanguageOptions;

export enum SmoothieCommands {
    ping = "ping",
    options = "options",
    language = "language",
}

export interface SmoothieCommandList {
    [SmoothieCommands.ping]: [command: SmoothieCommandType<PingOptions>];
    [SmoothieCommands.options]: [command: SmoothieCommandType<OptionsOptions>];
    [SmoothieCommands.language]: [
        command: SmoothieCommandType<LanguageOptions>
    ];
}
