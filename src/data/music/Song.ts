import { prop } from "@typegoose/typegoose";

export class Song {
    @prop({ required: true, default: new Date() })
    public addedAt!: Date;

    @prop({ required: true })
    public url!: string;

    @prop({ required: true })
    public title!: string;

    @prop({ required: true, default: null })
    public uploader!: string | null;

    @prop({ required: true, default: null })
    public uploaderURL!: string | null;

    @prop({ required: true, default: null })
    public thumbnailURL!: string | null;

    @prop({ required: true, default: 0 })
    public duration!: number;

    @prop({ required: true, default: 0 })
    public playCount!: number;
}
