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

export default interface SmoothieEmbedOutput {
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
