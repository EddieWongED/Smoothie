import { prop } from "@typegoose/typegoose";

export class GuildStates {
    @prop({ required: true, unique: true })
    public guildId!: string;

    @prop({ required: true, default: null })
    public currentPlaylistName?: string;

    @prop({ required: true, default: null })
    public textChannelId?: string;

    @prop({ required: true, default: null })
    public voiceChannelId?: string;

    @prop({ required: true, default: null })
    public playingNowMessageId?: string;

    @prop({ required: true, default: null })
    public queueMessageId?: string;
}
