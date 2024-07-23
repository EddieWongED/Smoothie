import type {
    ReturnModelType,
    DocumentType,
    mongoose,
} from "@typegoose/typegoose";
import { prop } from "@typegoose/typegoose";
import { Language, Languages } from "../../typings/i18n/i18n.js";
import type {
    Base,
    TimeStamps,
} from "@typegoose/typegoose/lib/defaultClasses.js";
import { getModelForClass } from "@typegoose/typegoose";
import type { ProjectionType } from "mongoose";
import Logging from "../../structures/logging/Logging.js";

export class Configs implements Base, TimeStamps {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public _id!: mongoose.Types.ObjectId;

    public id!: string;

    public createdAt!: Date;

    public updatedAt!: Date;

    @prop({ required: true, unique: true, immutable: true })
    public guildId!: string;

    @prop({ default: "$" })
    public prefix!: string;

    @prop({
        default: Languages.en_us,
        enum: Object.values(Languages),
    })
    public language!: Language;

    public static async findByGuildId(
        this: ReturnModelType<typeof Configs>,
        guildId: string,
        projection?: ProjectionType<Configs>
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

    public static async findAndSetPrefix(
        this: ReturnModelType<typeof Configs>,
        guildId: string,
        prefix: string
    ): Promise<Configs> {
        return this._findAndSet(guildId, "prefix", prefix);
    }

    public static async findAndSetLanguage(
        this: ReturnModelType<typeof Configs>,
        guildId: string,
        language: Language
    ): Promise<Configs> {
        const result = await this.findOneAndUpdate(
            { guildId: guildId },
            { $set: { language: language } },
            { returnOriginal: false, upsert: true, new: true }
        ).exec();

        return result;
    }

    public async setPrefixAndSave(this: DocumentType<Configs>, prefix: string) {
        await this.updateOne({
            $set: { prefix: prefix },
        });
    }

    public async setLanguageAndSave(
        this: DocumentType<Configs>,
        language: Language
    ) {
        await this.updateOne({
            $set: { language: language },
        });
    }

    private static async _create(
        this: ReturnModelType<typeof Configs>,
        guildId: string
    ) {
        const data = new ConfigsModel({
            guildId: guildId,
        });

        try {
            const configs = (await data.save()) as DocumentType<Configs>;
            return configs;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }

    private static async _findAndSet<
        Key extends keyof Omit<Configs, "guildId">
    >(
        this: ReturnModelType<typeof Configs>,
        guildId: string,
        key: Key,
        value: Configs[Key]
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
export const ConfigsModel = getModelForClass(Configs, {
    schemaOptions: { timestamps: true, autoCreate: true },
});
