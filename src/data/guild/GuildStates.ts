import type { mongoose } from "@typegoose/typegoose";
import { prop } from "@typegoose/typegoose";
import type { Base } from "@typegoose/typegoose/lib/defaultClasses.js";
import type { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses.js";

export class GuildStates implements Base, TimeStamps {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public _id!: mongoose.Types.ObjectId;

    public id!: string;

    public createdAt!: Date;

    public updatedAt!: Date;

    @prop({ required: true, unique: true, immutable: true })
    public guildId!: string;

    @prop({ required: true, default: null, type: () => String })
    public currentPlaylistName!: string | null;

    @prop({ required: true, default: null, type: () => String })
    public textChannelId!: string | null;

    @prop({ required: true, default: null, type: () => String })
    public voiceChannelId!: string | null;

    @prop({ required: true, default: null, type: () => String })
    public playingNowMessageId!: string | null;

    @prop({ required: true, default: null, type: () => String })
    public playingNowChannelId!: string | null;

    @prop({ required: true, default: null, type: () => String })
    public queueMessageId!: string | null;
}
