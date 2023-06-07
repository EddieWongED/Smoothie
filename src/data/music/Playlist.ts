import { prop } from "@typegoose/typegoose";
import { Song } from "./Song.js";
export class Playlist {
    @prop({ required: true })
    public name!: string;

    @prop({ required: true, default: new Date() })
    public createdAt!: Date;

    @prop({ type: () => [Song], required: true, default: [] })
    public queue!: Song[];
}
