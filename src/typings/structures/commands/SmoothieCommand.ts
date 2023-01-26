import type {
    ChatInputApplicationCommandData,
    CommandInteraction,
    PermissionResolvable,
} from "discord.js";
import type { SmoothieClient } from "../../../structures/client/SmoothieClient.js";
import type { OptionsOptions } from "../../commands/dev/OptionsOptions.js";
import type { PingOptions } from "../../commands/general/PingOptions.js";

interface RunArguments<OptionsType> {
    client: SmoothieClient;
    interaction: CommandInteraction;
    options: OptionsType;
}

export type SmoothieCommandType<OptionsType> = {
    userPermission?: PermissionResolvable[];
    run: (args: RunArguments<OptionsType>) => Promise<void>;
} & ChatInputApplicationCommandData;

export type SmoothieCommandTypes =
    SmoothieCommandType<SmoothieCommandOptionsType>;

export type SmoothieCommandOptionsType = OptionsOptions | PingOptions;

export enum SmoothieCommands {
    ping = "ping",
    options = "options",
}

export interface SmoothieCommandList {
    [SmoothieCommands.ping]: [command: SmoothieCommandType<PingOptions>];
    [SmoothieCommands.options]: [command: SmoothieCommandType<OptionsOptions>];
}
