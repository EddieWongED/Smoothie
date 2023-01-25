import type {
    ChatInputApplicationCommandData,
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionResolvable,
} from "discord.js";
import type { SmoothieClient } from "../structures/SmoothieClient.js";

interface RunArguments {
    client: SmoothieClient;
    interaction: CommandInteraction;
    args: CommandInteractionOptionResolver;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RunFunction = (args: RunArguments) => any;

export type SmoothieCommandType = {
    userPermission?: PermissionResolvable[];
    run: RunFunction;
} & ChatInputApplicationCommandData;
