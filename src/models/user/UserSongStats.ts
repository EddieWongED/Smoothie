import type { DocumentType, ReturnModelType } from "@typegoose/typegoose";
import { Ref, getModelForClass } from "@typegoose/typegoose";
import { prop, index } from "@typegoose/typegoose";
import { Song } from "../music/Song.js";
import type { ProjectionType } from "mongoose";
import Logging from "../../structures/logging/Logging.js";

@index({ guildId: 1, userId: 1, song: 1 }, { unique: true })
export class UserSongStats {
    @prop({ required: true, immutable: true })
    public guildId!: string;

    @prop({ required: true, immutable: true })
    public userId!: string;

    @prop({ ref: () => Song, required: true, immutable: true })
    public song!: Ref<Song>;

    @prop({ default: 0 })
    public listenCount!: number;

    public static async findByGuildIdUserIdAndSong(
        this: ReturnModelType<typeof UserSongStats>,
        guildId: string,
        userId: string,
        song: Ref<Song>,
        projection?: ProjectionType<UserSongStats>
    ) {
        const result = await this.findOne(
            { guildId: guildId, userId: userId, song: song },
            projection,
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        ).exec();

        if (result == null) {
            return this._create(guildId, userId, song);
        }

        return result;
    }

    public async incrementListenCountAndSave(
        this: DocumentType<UserSongStats>
    ) {
        await this.updateOne({ $inc: { listenCount: 1 } });
    }

    private static async _create(
        this: ReturnModelType<typeof UserSongStats>,
        guildId: string,
        userId: string,
        song: Ref<Song>
    ) {
        const data = new UserSongStatsModel({
            guildId: guildId,
            userId: userId,
            song: song,
        });

        try {
            const userStats =
                (await data.save()) as DocumentType<UserSongStats>;
            return userStats;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserSongStatsModel = getModelForClass(UserSongStats, {
    schemaOptions: { timestamps: true, autoCreate: true },
});
