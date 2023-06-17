import { prop } from "@typegoose/typegoose";

export class SongStats {
    @prop({ required: true })
    public url!: string;

    @prop({ required: true })
    public title!: string;

    @prop({ required: true, default: 0 })
    public listenCount!: number;
}
