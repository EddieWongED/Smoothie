import type {
    ReturnModelType,
    DocumentType,
    mongoose,
} from "@typegoose/typegoose";
import type { Ref } from "@typegoose/typegoose";
import type {
    Base,
    TimeStamps,
} from "@typegoose/typegoose/lib/defaultClasses.js";
import { prop, index } from "@typegoose/typegoose";
import { type ProjectionType } from "mongoose";
import { Song, SongModel } from "./Song.js";
import { getModelForClass } from "@typegoose/typegoose";
import arrayShuffle from "array-shuffle";
import stringSimilarity from "string-similarity";
import { Collection } from "discord.js";
import type { PipelineStage } from "mongoose";

@index({ guildId: 1, name: 1 }, { unique: true })
export class Playlist implements Base, TimeStamps {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public _id!: mongoose.Types.ObjectId;

    public id!: string;

    public createdAt!: Date;

    public updatedAt!: Date;

    @prop({ required: true, immutable: true })
    public guildId!: string;

    @prop({ required: true, immutable: true })
    public name!: string;

    @prop({ ref: () => Song, default: null })
    public currentSong!: Ref<Song> | null;

    @prop({ ref: () => Song, default: [] })
    public queue!: Ref<Song>[];

    public static async findAllByGuildId(
        this: ReturnModelType<typeof Playlist>,
        guildId: string,
        projection?: ProjectionType<Playlist>
    ) {
        const result = await this.find({ guildId: guildId }, projection).exec();

        return result;
    }

    public static async findByGuildIdAndName(
        this: ReturnModelType<typeof Playlist>,
        guildId: string,
        name: string,
        projection?: ProjectionType<Playlist>
    ) {
        const result = await this.findOne(
            { guildId: guildId, name: name },
            projection
        ).exec();

        return result;
    }

    public async addSong(
        this: DocumentType<Playlist>,
        song: Song | Song[],
        when: "now" | "next" | "last" = "next"
    ) {
        const songs = Array.isArray(song) ? song : [song];

        const playlist = await PlaylistModel.findByIdAndUpdate(
            // eslint-disable-next-line @typescript-eslint/naming-convention
            { _id: this._id },
            {
                $pullAll: { queue: songs },
            },
            { new: true }
        );

        if (!playlist) {
            return 0;
        }

        this.overwrite(playlist);

        let index = -1;
        if (playlist.currentSong) {
            index = playlist.queue.indexOf(playlist.currentSong);
        }

        if (index !== -1 && (when === "now" || when === "next")) {
            index = (index + 1) % playlist.queue.length;
        }

        await this.updateOne({
            $push: {
                queue: {
                    $each: songs,
                    $position: index,
                },
            },
        });
        return songs.length;
    }

    public async shuffle(this: DocumentType<Playlist>) {
        this.queue = arrayShuffle(this.queue);
        await this.updateOne({
            $set: { queue: this.queue },
        });
    }

    public async getCurrentSong(this: DocumentType<Playlist>) {
        if (this.currentSong === null && this.queue.length > 0) {
            this.currentSong = this.queue[0] ?? null;
            if (this.currentSong === null) {
                return null;
            } else {
                await this.updateOne({
                    $set: { currentSong: this.currentSong },
                });
            }
        }
        if (this.currentSong === null) {
            return null;
        }
        return await SongModel.findById(this.currentSong._id).exec();
    }

    public async prevSong(this: DocumentType<Playlist>) {
        if (this.currentSong == null) {
            return this.getCurrentSong();
        }
        const index = this.queue.indexOf(this.currentSong);

        let prevIndex = -1;
        // Fall back to the first song if the current song is not in the queue for some reason
        if (index == -1) {
            prevIndex = 0;
        } else if (index == 0) {
            prevIndex = this.queue.length - 1;
        } else {
            prevIndex = index - 1;
        }

        if (prevIndex >= 0) {
            this.currentSong = this.queue[prevIndex] ?? null;
            await this.updateOne({
                $set: { currentSong: this.currentSong },
            });
        }

        if (this.currentSong === null) {
            return null;
        }

        return await SongModel.findById(this.currentSong._id).exec();
    }

    public async nextSong(this: DocumentType<Playlist>) {
        if (this.currentSong == null) {
            return this.getCurrentSong();
        }
        const index = this.queue.indexOf(this.currentSong);
        // Fall back to the first song if the current song is not in the queue for some reason (since indexOf return -1 and -1 + 1 = 0)
        if (this.queue.length > 0) {
            const nextIndex = (index + 1) % this.queue.length;
            this.currentSong = this.queue[nextIndex] ?? null;
            await this.updateOne({
                $set: { currentSong: this.currentSong },
            });
        }

        if (this.currentSong === null) {
            return null;
        }

        return await SongModel.findById(this.currentSong._id).exec();
    }

    public async getQueue(
        this: DocumentType<Playlist>,
        select?: ProjectionType<Song>,
        sliceFrom?: number,
        num?: number
    ) {
        try {
            const pipeline: PipelineStage[] = [
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    $match: { _id: this._id },
                },
                {
                    $addFields: {
                        currentSongIndex: {
                            $indexOfArray: ["$queue", "$currentSong"],
                        },
                    },
                },
                {
                    $project: {
                        queue: {
                            $cond: {
                                if: { $eq: ["$currentSongIndex", -1] },
                                then: "$queue",
                                else: {
                                    $concatArrays: [
                                        {
                                            $slice: [
                                                "$queue",
                                                "$currentSongIndex",
                                                {
                                                    $subtract: [
                                                        {
                                                            $size: "$queue",
                                                        },
                                                        "$currentSongIndex",
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            $slice: [
                                                "$queue",
                                                "$currentSongIndex",
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            ];

            if (sliceFrom && num) {
                pipeline.push({
                    $project: {
                        queue: { $slice: ["$queue", sliceFrom, num] },
                    },
                });
            }

            const result = await PlaylistModel.aggregate<
                DocumentType<Playlist>
            >(pipeline).exec();

            const playlist = result[0];

            if (!playlist) {
                return [];
            }

            const populated = await PlaylistModel.populate<{
                queue: DocumentType<Song>[];
            }>(playlist, { path: "queue", select: select });

            return populated.queue;
        } catch (err) {
            return [];
        }
    }

    public async getTopPlayedSongs(this: DocumentType<Playlist>, limit = 0) {
        const playlist = await PlaylistModel.findById(this._id)
            .populate<{ queue: DocumentType<Song>[] }>({
                path: "queue",
                select: "_id title playCount",
                options: { sort: { playCount: -1 }, limit: limit },
            })
            .exec();

        if (!playlist) {
            return [];
        }

        return playlist.queue;
    }

    // TODO: Use text index instead
    public async search(this: DocumentType<Playlist>, query: string) {
        const similarityMap = new Collection<string, number>();
        const queue = await this.getQueue({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: 1,
            title: 1,
        });
        queue.forEach((song, i) => {
            const similarity = stringSimilarity.compareTwoStrings(
                query.toLowerCase(),
                song.title.toLowerCase()
            );
            similarityMap.set(`${i + 1}. ${song.title}`, similarity);
        });
        return similarityMap
            .filter((similarity) => similarity !== 0)
            .sort((s1, s2) => s2 - s1);
    }

    public async removeSong(this: DocumentType<Playlist>, song: Song) {
        if (this.currentSong?._id.equals(song._id)) {
            await this.nextSong();
        }
        await this.updateOne({ $pull: { queue: song._id } });
    }

    public async getTotalDuration(this: DocumentType<Playlist>) {
        const result = await PlaylistModel.aggregate<{
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: mongoose.Types.ObjectId;
            totalDuration: number;
        }>([
            {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                $match: { _id: this._id },
            },
            {
                $lookup: {
                    from: "songs",
                    localField: "queue",
                    foreignField: "_id",
                    as: "queue",
                },
            },
            {
                $unwind: "$queue",
            },
            {
                $group: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    _id: "$_id",
                    totalDuration: { $sum: "$queue.duration" },
                },
            },
        ]);

        return result[0]?.totalDuration ?? 0;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistModel = getModelForClass(Playlist, {
    schemaOptions: { timestamps: true, autoCreate: true },
});
