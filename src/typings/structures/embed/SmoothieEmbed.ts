import type {
    APIAttachment,
    APIEmbed,
    Attachment,
    AttachmentBuilder,
    AttachmentPayload,
    BufferResolvable,
    JSONEncodable,
} from "discord.js";
import type { Stream } from "node:stream";
import type { LoggingLevel } from "../logging/Logging.js";

export interface SmoothieEmbedOutput {
    embeds?: (JSONEncodable<APIEmbed> | APIEmbed)[];
    files?: (
        | BufferResolvable
        | Stream
        | JSONEncodable<APIAttachment>
        | Attachment
        | AttachmentBuilder
        | AttachmentPayload
    )[];
}

export interface EmbedArgs {
    title: string;
    description: string;
}

export type LevelEmbedArgs = EmbedArgs & { level: LoggingLevel };
