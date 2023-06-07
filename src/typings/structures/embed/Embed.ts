import type { APIEmbedField, RGBTuple } from "discord.js";
import type { LoggingLevel } from "../logging/Logging.js";

export interface BasicEmbedArgs {
    title: string;
    description?: string | null;
    footer?: string;
    color?: number | RGBTuple;
    fields?: APIEmbedField[];
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
