import { prop } from "@typegoose/typegoose";

export class Song {
    @prop({ required: true })
    public title!: string;

    @prop({ required: true, default: new Date() })
    public addedAt!: Date;

    @prop({ required: true })
    public url!: string;

    @prop({ required: true, default: 0 })
    public playCount!: number;
}
