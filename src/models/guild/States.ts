import type {
    ReturnModelType,
    DocumentType,
    mongoose,
    Ref,
} from "@typegoose/typegoose";
import { prop } from "@typegoose/typegoose";
import type {
    Base,
    TimeStamps,
} from "@typegoose/typegoose/lib/defaultClasses.js";
import { getModelForClass } from "@typegoose/typegoose";
import type { ProjectionType } from "mongoose";
import Logging from "../../structures/logging/Logging.js";
import { Playlist } from "../music/Playlist.js";

export class States implements Base, TimeStamps {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public _id!: mongoose.Types.ObjectId;

    public id!: string;

    public createdAt!: Date;

    public updatedAt!: Date;

    @prop({ required: true, unique: true, immutable: true })
    public guildId!: string;

    @prop({ default: null, ref: () => Playlist })
    public currentPlaylist!: Ref<Playlist> | null;

    @prop({ default: null, type: () => String })
    public textChannelId!: string | null;

    @prop({ default: null, type: () => String })
    public voiceChannelId!: string | null;

    @prop({ default: null, type: () => String })
    public playingNowMessageId!: string | null;

    @prop({ default: null, type: () => String })
    public playingNowChannelId!: string | null;

    @prop({ default: null, type: () => String })
    public queueMessageId!: string | null;

    public static async findByGuildId(
        this: ReturnModelType<typeof States>,
        guildId: string,
        projection?: ProjectionType<States>
    ) {
        const result = await this.findOne({ guildId: guildId }, projection, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }).exec();

        if (result == null) {
            return this._create(guildId);
        }

        return result;
    }

    public static async findAll(
        this: ReturnModelType<typeof States>,
        projection?: ProjectionType<States>
    ) {
        const result = await this.find({}, projection, {}).exec();

        return result;
    }

    public static async findCurrentPlaylist(
        this: ReturnModelType<typeof States>,
        guildId: string
    ) {
        const states = await StatesModel.findOne(
            { guildId: guildId },
            {
                currentPlaylist: 1,
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        )
            .populate<{ currentPlaylist: DocumentType<Playlist> }>(
                "currentPlaylist"
            )
            .exec();

        if (states == null) {
            return null;
        }

        return states.currentPlaylist;
    }

    public static async findAndSetCurrentPlaylistIfNull(
        this: ReturnModelType<typeof States>,
        guildId: string,
        currentPlaylist: Ref<Playlist>
    ): Promise<States | null> {
        const result = await this.findOneAndUpdate(
            { guildId: guildId, currentPlaylist: null },
            { $set: { currentPlaylist: currentPlaylist } },
            { new: true }
        ).exec();

        return result;
    }

    public static async findAndSetCurrentPlaylist(
        this: ReturnModelType<typeof States>,
        guildId: string,
        currentPlaylist: Ref<Playlist> | null
    ): Promise<States> {
        return this._findAndSet(guildId, "currentPlaylist", currentPlaylist);
    }

    public static async findAndSetTextChannelId(
        this: ReturnModelType<typeof States>,
        guildId: string,
        textChannelId: string | null
    ): Promise<States> {
        return this._findAndSet(guildId, "textChannelId", textChannelId);
    }

    public static async findAndSetVoiceChannelId(
        this: ReturnModelType<typeof States>,
        guildId: string,
        voiceChannelId: string | null
    ): Promise<States> {
        return this._findAndSet(guildId, "voiceChannelId", voiceChannelId);
    }

    public static async findAndSetPlayingNowMessageId(
        this: ReturnModelType<typeof States>,
        guildId: string,
        playingNowMessageId: string | null
    ): Promise<States> {
        return this._findAndSet(
            guildId,
            "playingNowMessageId",
            playingNowMessageId
        );
    }

    public static async findAndSetPlayingNowChannelId(
        this: ReturnModelType<typeof States>,
        guildId: string,
        playingNowChannelId: string | null
    ): Promise<States> {
        return this._findAndSet(
            guildId,
            "playingNowChannelId",
            playingNowChannelId
        );
    }

    public static async findAndSetQueueMessageId(
        this: ReturnModelType<typeof States>,
        guildId: string,
        queueMessageId: string | null
    ): Promise<States> {
        return this._findAndSet(guildId, "queueMessageId", queueMessageId);
    }

    public async setCurrentPlaylistAndSave(
        this: DocumentType<States>,
        currentPlaylist: Ref<Playlist> | null
    ) {
        await this.updateOne({
            $set: { currentPlaylist: currentPlaylist },
        });
    }

    public async setTextChannelIdAndSave(
        this: DocumentType<States>,
        textChannelId: string | null
    ) {
        await this.updateOne({
            $set: { textChannelId: textChannelId },
        });
    }

    public async setVoiceChannelIdAndSave(
        this: DocumentType<States>,
        voiceChannelId: string | null
    ) {
        await this.updateOne({
            $set: { voiceChannelId: voiceChannelId },
        });
    }

    public async setPlayingNowMessageIdAndSave(
        this: DocumentType<States>,
        playingNowMessageId: string | null
    ) {
        await this.updateOne({
            $set: { playingNowMessageId: playingNowMessageId },
        });
    }

    public async setPlayingNowChannelIdAndSave(
        this: DocumentType<States>,
        playingNowChannelId: string | null
    ) {
        await this.updateOne({
            $set: { playingNowChannelId: playingNowChannelId },
        });
    }

    public async setQueueMessageIdAndSave(
        this: DocumentType<States>,
        queueMessageId: string | null
    ) {
        await this.updateOne({
            $set: { queueMessageId: queueMessageId },
        });
    }

    private static async _create(
        this: ReturnModelType<typeof States>,
        guildId: string
    ) {
        const data = new StatesModel({
            guildId: guildId,
        });

        try {
            const states = (await data.save()) as States;
            return states;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }

    private static async _findAndSet<Key extends keyof Omit<States, "guildId">>(
        this: ReturnModelType<typeof States>,
        guildId: string,
        key: Key,
        value: States[Key]
    ) {
        const result = await this.findOneAndUpdate(
            { guildId: guildId },
            { $set: { [key]: value } },
            { upsert: true, new: true }
        ).exec();

        return result;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const StatesModel = getModelForClass(States, {
    schemaOptions: { timestamps: true, autoCreate: true },
});
