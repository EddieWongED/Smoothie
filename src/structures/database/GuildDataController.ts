import { Collection } from "discord.js";
import type { GuildData } from "../../data/guild/GuildData.js";
import GuildDataModel from "../../models/GuildDataModel.js";
import Logging from "../logging/Logging.js";
import type { MutexInterface } from "async-mutex";
import { Mutex, withTimeout } from "async-mutex";
import mongoose from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class GuildDataController {
    static readWriteMutex: MutexInterface = withTimeout(new Mutex(), 2000);
    static readMutex: MutexInterface = withTimeout(new Mutex(), 2000);
    static readCount = 0;

    static async get<Key extends keyof Omit<GuildData, "guildId">>(
        guildId: string,
        key: Key
    ) {
        // Readers–writers problem
        // Acquire resource lock
        await GuildDataController.readMutex.acquire();
        GuildDataController.readCount++;
        if (GuildDataController.readCount === 1) {
            await GuildDataController.readWriteMutex.acquire();
        }
        GuildDataController.readMutex.release();

        // Start reading
        let data: GuildData | null = null;
        try {
            data = await GuildDataModel.findOne<GuildData>(
                {
                    guildId: guildId,
                },
                [key]
            ).exec();
            if (!data) {
                data = await GuildDataController._create(guildId);
            }
        } catch (err) {
            Logging.error(err);
        }

        // Release resource lock
        await GuildDataController.readMutex.acquire();
        GuildDataController.readCount--;
        if (GuildDataController.readCount === 0) {
            GuildDataController.readWriteMutex.release();
        }
        GuildDataController.readMutex.release();
        if (!data) return null;
        return data[key];
    }

    static async update<Key extends keyof Omit<GuildData, "guildId">>(
        guildId: string,
        key: Key,
        value: GuildData[Key]
    ) {
        // Acquire resource lock
        await GuildDataController.readWriteMutex.acquire();

        // Start writing
        let data: GuildData | null = null;
        try {
            data = await GuildDataModel.findOneAndUpdate<GuildData>(
                { guildId: guildId },
                { $set: { [key]: value } },
                { returnOriginal: false, upsert: true }
            ).exec();
        } catch (err) {
            Logging.error(err);
        }

        // Release resource lock
        GuildDataController.readWriteMutex.release();
        return data;
    }

    static async remove(guildId: string) {
        // Acquire resource lock
        await GuildDataController.readWriteMutex.acquire();

        // Start writing
        let data = false;
        try {
            const result = await GuildDataModel.deleteOne({
                guildId: guildId,
            }).exec();
            data = result.acknowledged && result.deletedCount >= 1;
        } catch (err) {
            Logging.error(err);
        }

        // Release resource lock
        GuildDataController.readWriteMutex.release();
        return data;
    }

    static async getAll<Key extends keyof Omit<GuildData, "guildId">>(
        key: Key
    ) {
        // Readers–writers problem
        // Acquire resource lock
        await GuildDataController.readMutex.acquire();
        GuildDataController.readCount++;
        if (GuildDataController.readCount === 1) {
            await GuildDataController.readWriteMutex.acquire();
        }
        GuildDataController.readMutex.release();

        // Start reading
        const collection = new Collection<string, GuildData[Key]>();
        try {
            const result = await GuildDataModel.find<GuildData>({}, [
                "guildId",
                key,
            ]);
            result.forEach((guildStates) => {
                collection.set(guildStates.guildId, guildStates[key]);
            });
        } catch (err) {
            Logging.error(err);
        }

        // Release resource lock
        await GuildDataController.readMutex.acquire();
        GuildDataController.readCount--;
        if (GuildDataController.readCount === 0) {
            GuildDataController.readWriteMutex.release();
        }
        GuildDataController.readMutex.release();
        return collection;
    }

    private static async _create(guildId: string) {
        // Create new data
        const data = new GuildDataModel({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: new mongoose.Types.ObjectId(),
            guildId: guildId,
        });

        try {
            return (await data.save()) as GuildData | null;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }
}
