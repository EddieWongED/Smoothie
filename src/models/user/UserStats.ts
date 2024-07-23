import type { DocumentType, ReturnModelType } from "@typegoose/typegoose";
import { getModelForClass } from "@typegoose/typegoose";
import { prop, index } from "@typegoose/typegoose";
import type { ProjectionType } from "mongoose";
import Logging from "../../structures/logging/Logging.js";

@index({ guildId: 1, userId: 1 }, { unique: true })
export class UserStats {
    @prop({ required: true, immutable: true })
    public guildId!: string;

    @prop({ required: true, immutable: true })
    public userId!: string;

    // In minutes
    @prop({ default: 0 })
    public stayDuration!: number;

    public static async findByGuildIdAndUserId(
        this: ReturnModelType<typeof UserStats>,
        guildId: string,
        userId: string,
        projection?: ProjectionType<UserStats>
    ) {
        const result = await this.findOne(
            { guildId: guildId, userId: userId },
            projection,
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        ).exec();

        if (result == null) {
            return this._create(guildId, userId);
        }

        return result;
    }

    public static async findAllByGuildId(
        this: ReturnModelType<typeof UserStats>,
        guildId: string,
        projection?: ProjectionType<UserStats>
    ) {
        const result = await this.find({ guildId: guildId }, projection)
            .sort({
                stayDuration: -1,
            })
            .exec();
        return result;
    }

    public async incrementStayDurationAndSave(
        this: DocumentType<UserStats>,
        by: number
    ) {
        await this.updateOne({ $inc: { stayDuration: by } });
    }

    private static async _create(
        this: ReturnModelType<typeof UserStats>,
        guildId: string,
        userId: string
    ) {
        const data = new UserStatsModel({
            guildId: guildId,
            userId: userId,
        });

        try {
            const userStats = (await data.save()) as DocumentType<UserStats>;
            return userStats;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserStatsModel = getModelForClass(UserStats, {
    schemaOptions: { timestamps: true, autoCreate: true },
});
