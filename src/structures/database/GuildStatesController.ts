import mongoose from "mongoose";
import type { GuildStates } from "../../data/guild/GuildStates.js";
import GuildStatesModel from "../../models/GuildStatesModel.js";
import Logging from "../logging/Logging.js";

export default class GuildStatesController {
    async create(guildId: string | null): Promise<GuildStates | null> {
        if (!guildId) return null;

        // Check if the data exists or not
        const receivedGuildData = (await GuildStatesModel.findOne({
            guildId: guildId,
        })) as unknown as GuildStates | null;
        if (receivedGuildData) {
            return receivedGuildData;
        }

        // Create new data
        const guildData = new GuildStatesModel({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: new mongoose.Types.ObjectId(),
            guildId: guildId,
        });

        try {
            const data =
                (await (guildData.save() as unknown)) as GuildStates | null;
            return data;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }

    async read(guildId: string | null): Promise<GuildStates | null> {
        if (!guildId) return null;

        try {
            const guildData = (await GuildStatesModel.findOne({
                guildId: guildId,
            })) as unknown as GuildStates | null;
            if (!guildData) {
                return this.create(guildId);
            }
            return guildData;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }

    async update<Key extends keyof GuildStates>(
        guildId: string | null,
        key: Key,
        value: GuildStates[Key]
    ): Promise<GuildStates | null> {
        if (!guildId) return null;
        if (key === "guildId") return null;

        try {
            const data = await GuildStatesModel.findOneAndUpdate(
                { guildId: guildId },
                { $set: { [key]: value } },
                { returnOriginal: false, upsert: true }
            );
            return data as unknown as GuildStates | null;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }

    async remove(guildId: string | null): Promise<boolean> {
        if (!guildId) return false;
        try {
            const result = await GuildStatesModel.deleteOne({
                guildId: guildId,
            });
            return result.acknowledged && result.deletedCount >= 1;
        } catch (err) {
            Logging.error(err);
        }
        return false;
    }
}
