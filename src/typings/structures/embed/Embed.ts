import type { RGBTuple } from "discord.js";
import type { LoggingLevel } from "../logging/Logging.js";

export interface BasicEmbedArgs {
    title: string;
    description: string;
    footer?: string;
    color?: number | RGBTuple;
}

export type LevelEmbedArgs = BasicEmbedArgs & { level: LoggingLevel };

export type ConfirmEmbedArgs = BasicEmbedArgs & { footer: string };

export interface PaginationEmbedArgs {
    title: string;
    list: string[];
    page: number;
    footer: string;
    itemsPerPage?: number;
}
