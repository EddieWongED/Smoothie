import { prop } from "@typegoose/typegoose";
import { SongStats } from "../music/SongStats.js";

export class UserStats {
    @prop({ required: true, immutable: true })
    public userId!: string;

    @prop({ type: () => [SongStats], required: true, default: [] })
    public songStats!: SongStats[];

    // In minutes
    @prop({ required: true, default: 0 })
    public stayDuration!: number;
}
