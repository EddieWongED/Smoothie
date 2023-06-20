import { prop } from "@typegoose/typegoose";

export class SongStats {
    @prop({ required: true, immutable: true })
    public url!: string;

    @prop({ required: true, immutable: true })
    public title!: string;

    @prop({ required: true, default: 0 })
    public listenCount!: number;
}
