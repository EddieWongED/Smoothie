import type {
    ReturnModelType,
    DocumentType,
    mongoose,
} from "@typegoose/typegoose";
import type {
    Base,
    TimeStamps,
} from "@typegoose/typegoose/lib/defaultClasses.js";
import { prop, index } from "@typegoose/typegoose";
import { getModelForClass } from "@typegoose/typegoose";
import type { ProjectionType } from "mongoose";
import Logging from "../../structures/logging/Logging.js";

@index({ guildId: 1, url: 1 }, { unique: true })
export class Song implements Base, TimeStamps {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public _id!: mongoose.Types.ObjectId;

    public id!: string;

    public createdAt!: Date;

    public updatedAt!: Date;

    @prop({ required: true, immutable: true })
    public guildId!: string;

    @prop({ required: true, immutable: true, trim: true })
    public url!: string;

    @prop({ required: true, immutable: true, trim: true })
    public title!: string;

    @prop({ required: true, immutable: true })
    public duration!: number;

    @prop({ default: 0 })
    public playCount!: number;

    public static async findAllByGuildId(
        this: ReturnModelType<typeof Song>,
        guildId: string,
        projection?: ProjectionType<Song>
    ) {
        const result = await this.find({ guildId: guildId }, projection).exec();

        return result;
    }

    public static async findByGuildIdAndUrl(
        this: ReturnModelType<typeof Song>,
        guildId: string,
        url: string,
        projection?: ProjectionType<Song>
    ) {
        const result = await this.findOne(
            { guildId: guildId, url: url },
            projection
        ).exec();

        return result;
    }

    public static async findAndIncrementPlayCount(
        this: ReturnModelType<typeof Song>,
        guildId: string,
        url: string
    ) {
        const result = await this.findOneAndUpdate(
            { guildId: guildId, url: url },
            { $inc: { playCount: 1 } },
            { new: true }
        ).exec();

        return result;
    }

    public static async upsertSongs(
        this: ReturnModelType<typeof Song>,
        guildId: string,
        songs: {
            url: string;
            title: string;
            duration: number;
        }[],
        projection?: ProjectionType<Song>
    ) {
        try {
            await SongModel.bulkWrite(
                songs.map(
                    (song) => {
                        return {
                            updateOne: {
                                filter: {
                                    guildId: guildId,
                                    url: song.url,
                                    title: song.title,
                                    duration: song.duration,
                                },
                                update: {},
                                upsert: true,
                            },
                        };
                    },
                    { ordered: false }
                )
            );
        } catch (err) {
            Logging.error(err);
        }

        const foundSongs = await SongModel.find(
            { guildId: guildId, url: { $in: songs.map((song) => song.url) } },
            projection
        ).exec();

        return foundSongs;
    }

    public async incrementPlayCountAndSave(this: DocumentType<Song>) {
        await this.updateOne({ $inc: { playCount: 1 } });
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SongModel = getModelForClass(Song, {
    schemaOptions: { timestamps: true, autoCreate: true },
});
