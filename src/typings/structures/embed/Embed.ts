import type { CommandPayload } from "../commands/SmoothieCommand.js";
import type { LoggingLevel } from "../logging/Logging.js";

export interface EmbedArgs {
    title: string;
    description: string;
}

export type LevelEmbedArgs = EmbedArgs & { level: LoggingLevel };

export type ConfirmEmbedArgs = EmbedArgs & {
    payload: CommandPayload;
};
