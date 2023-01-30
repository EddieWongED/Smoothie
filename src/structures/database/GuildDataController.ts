import mongoose from "mongoose";
import GuildDataModel from "../../models/GuildData.js";
import type GuildData from "../../typings/models/GuildData.js";
import Logging from "../logging/Logging.js";

export default class GuildDataController {
    async create(guildId: string | null): Promise<GuildData | null> {
        if (!guildId) return null;

        // Check if the data exists or not
        const receivedGuildData = (await GuildDataModel.findOne({
            guildId: guildId,
        })) as unknown as GuildData | null;
        if (receivedGuildData) {
            return receivedGuildData;
        }

        // Create new data
        const guildData = new GuildDataModel({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: new mongoose.Types.ObjectId(),
            guildId: guildId,
        });

        try {
            const data =
                (await (guildData.save() as unknown)) as GuildData | null;
            return data;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }

    async read(guildId: string | null): Promise<GuildData | null> {
        if (!guildId) return null;

        try {
            const guildData = (await GuildDataModel.findOne({
                guildId: guildId,
            })) as unknown as GuildData | null;
            if (!guildData) {
                return this.create(guildId);
            }
            return guildData;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }

    async update<Key extends keyof GuildData>(
        guildId: string | null,
        key: Key,
        value: GuildData[Key]
    ): Promise<GuildData | null> {
        if (!guildId) return null;
        if (key === "guildId") return null;

        try {
            const data = await GuildDataModel.findOneAndUpdate(
                { guildId: guildId },
                { $set: { [key]: value } },
                { returnOriginal: false, upsert: true }
            );
            return data as unknown as GuildData | null;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }

    async remove(guildId: string | null): Promise<boolean> {
        if (!guildId) return false;
        try {
            const result = await GuildDataModel.deleteOne({ guildId: guildId });
            return result.acknowledged && result.deletedCount >= 1;
        } catch (err) {
            Logging.error(err);
        }
        return false;
    }
}
