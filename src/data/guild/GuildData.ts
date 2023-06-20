import type { mongoose } from "@typegoose/typegoose";
import { prop } from "@typegoose/typegoose";
import { Language, Languages } from "../../typings/i18n/i18n.js";
import { Playlist } from "../music/Playlist.js";
import type {
    Base,
    TimeStamps,
} from "@typegoose/typegoose/lib/defaultClasses.js";
import { UserStats } from "../user/UserStats.js";

export class GuildData implements Base, TimeStamps {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public _id!: mongoose.Types.ObjectId;

    public id!: string;

    public createdAt!: Date;

    public updatedAt!: Date;

    @prop({ required: true, unique: true, immutable: true })
    public guildId!: string;

    @prop({ required: true, default: "$" })
    public prefix!: string;

    @prop({
        required: true,
        default: Languages.en,
        enum: Object.values(Languages),
    })
    public language!: Language;

    @prop({ type: () => [Playlist], required: true, default: [] })
    public playlists!: Playlist[];

    @prop({ type: () => [UserStats], required: true, default: [] })
    public userStats!: UserStats[];
}
