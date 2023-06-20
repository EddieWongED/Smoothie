import { prop } from "@typegoose/typegoose";

export class Song {
    @prop({ required: true, default: new Date(), immutable: true })
    public addedAt!: Date;

    @prop({ required: true, immutable: true })
    public url!: string;

    @prop({ required: true })
    public title!: string;

    @prop({ required: true, default: null, type: () => String })
    public uploader!: string | null;

    @prop({ required: true, default: null, type: () => String })
    public uploaderURL!: string | null;

    @prop({ required: true, default: null, type: () => String })
    public thumbnailURL!: string | null;

    @prop({ required: true, default: 0 })
    public duration!: number;

    @prop({ required: true, default: 0 })
    public playCount!: number;
}
