import type {
    ChatInputApplicationCommandData,
    CommandInteraction,
    Message,
    PermissionResolvable,
} from "discord.js";
import type { SmoothieClient } from "../../../structures/client/SmoothieClient.js";
import type { OptionsOptions } from "../../commands/dev/OptionsOptions.js";
import type { PingOptions } from "../../commands/general/PingOptions.js";

interface RunArguments<OptionsType> {
    client: SmoothieClient;
    payload: CommandInteraction | Message;
    options: OptionsType;
}

export type SmoothieCommandType<OptionsType> = {
    userPermission?: PermissionResolvable[];
    aliases?: string[];
    run: (args: RunArguments<OptionsType>) => Promise<void>;
} & ChatInputApplicationCommandData;

export type SmoothieCommandTypes =
    SmoothieCommandType<SmoothieCommandOptionsType>;

// All data below need to update when adding a new command
export type SmoothieCommandOptionsType = OptionsOptions | PingOptions;

export enum SmoothieCommands {
    ping = "ping",
    options = "options",
}

export interface SmoothieCommandList {
    [SmoothieCommands.ping]: [command: SmoothieCommandType<PingOptions>];
    [SmoothieCommands.options]: [command: SmoothieCommandType<OptionsOptions>];
}
