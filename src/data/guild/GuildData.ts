import { prop } from "@typegoose/typegoose";
import { Language, Languages } from "../../typings/i18n/i18n.js";
import { Playlist } from "../music/Playlist.js";

export class GuildData {
    @prop({ required: true, unique: true })
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
}
