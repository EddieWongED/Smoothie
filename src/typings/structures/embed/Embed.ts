import type {
    APIEmbedAuthor,
    APIEmbedField,
    APISelectMenuOption,
    RGBTuple,
} from "discord.js";
import type { LoggingLevel } from "../logging/Logging.js";

export interface BasicEmbedArgs {
    title: string;
    description?: string | null;
    footer?: string | undefined;
    color?: number | RGBTuple;
    fields?: APIEmbedField[];
    thumbnail?: string | null;
    url?: string | null;
    author?: APIEmbedAuthor | null;
}

export type LevelEmbedArgs = BasicEmbedArgs & { level: LoggingLevel };

export type OptionsEmbedArgs = BasicEmbedArgs & {
    options: APISelectMenuOption[];
    placeholder?: string;
    minValues?: number;
    maxValues?: number;
};

export type ConfirmEmbedArgs = BasicEmbedArgs;

export interface PaginationEmbedArgs {
    title: string;
    list: string[];
    page: number;
    footer: string;
    itemsPerPage?: number;
    indexing?: boolean;
}

export type PlayingNowEmbedArgs = BasicEmbedArgs & {
    playedFor: number;
    duration: number;
    isPaused: boolean;
    queueButtonText: string;
    playlistInfoButtonText: string;
};
