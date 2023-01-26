import type {
    ChatInputApplicationCommandData,
    CommandInteraction,
    PermissionResolvable,
} from "discord.js";
import type { SmoothieClient } from "../../../structures/client/SmoothieClient.js";
import type { SmoothieCommandOptionsType } from "./SmoothieCommandOptions.js";

interface RunArguments {
    client: SmoothieClient;
    interaction: CommandInteraction;
    options: SmoothieCommandOptionsType;
}

type RunFunction = (args: RunArguments) => Promise<void>;

export type SmoothieCommandType = {
    userPermission?: PermissionResolvable[];
    run: RunFunction;
} & ChatInputApplicationCommandData;
