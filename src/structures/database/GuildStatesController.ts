import { Collection } from "discord.js";
import type { GuildStates } from "../../data/guild/GuildStates.js";
import GuildStatesModel from "../../models/GuildStatesModel.js";
import Logging from "../logging/Logging.js";
import type { MutexInterface } from "async-mutex";
import { Mutex, withTimeout } from "async-mutex";
import mongoose from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class GuildStatesController {
    static readWriteMutex: MutexInterface = withTimeout(new Mutex(), 2000);
    static readMutex: MutexInterface = withTimeout(new Mutex(), 2000);
    static readCount = 0;

    static async get<Key extends keyof Omit<GuildStates, "guildId">>(
        guildId: string,
        key: Key
    ) {
        // Readers–writers problem
        // Acquire resource lock
        await GuildStatesController.readMutex.acquire();
        GuildStatesController.readCount++;
        if (GuildStatesController.readCount === 1) {
            await GuildStatesController.readWriteMutex.acquire();
        }
        GuildStatesController.readMutex.release();

        // Start reading
        let data: GuildStates | null = null;
        try {
            data = await GuildStatesModel.findOne<GuildStates>(
                {
                    guildId: guildId,
                },
                [key],
                { upsert: true }
            ).exec();
            if (!data) {
                data = await GuildStatesController._create(guildId);
            }
        } catch (err) {
            Logging.error(err);
        }

        // Release resource lock
        await GuildStatesController.readMutex.acquire();
        GuildStatesController.readCount--;
        if (GuildStatesController.readCount === 0) {
            GuildStatesController.readWriteMutex.release();
        }
        GuildStatesController.readMutex.release();
        if (!data) return null;
        return data[key];
    }

    static async update<Key extends keyof Omit<GuildStates, "guildId">>(
        guildId: string,
        key: Key,
        value: GuildStates[Key]
    ) {
        // Acquire resource lock
        await GuildStatesController.readWriteMutex.acquire();

        // Start writing
        let data: GuildStates | null = null;
        try {
            data = await GuildStatesModel.findOneAndUpdate<GuildStates>(
                { guildId: guildId },
                { $set: { [key]: value } },
                { returnOriginal: false, upsert: true }
            ).exec();
        } catch (err) {
            Logging.error(err);
        }

        // Release resource lock
        GuildStatesController.readWriteMutex.release();
        return data;
    }

    static async remove(guildId: string) {
        // Acquire resource lock
        await GuildStatesController.readWriteMutex.acquire();

        // Start writing
        let data = false;
        try {
            const result = await GuildStatesModel.deleteOne({
                guildId: guildId,
            }).exec();
            data = result.acknowledged && result.deletedCount >= 1;
        } catch (err) {
            Logging.error(err);
        }

        // Release resource lock
        GuildStatesController.readWriteMutex.release();
        return data;
    }

    static async getAll<Key extends keyof Omit<GuildStates, "guildId">>(
        key: Key
    ) {
        // Readers–writers problem
        // Acquire resource lock
        await GuildStatesController.readMutex.acquire();
        GuildStatesController.readCount++;
        if (GuildStatesController.readCount === 1) {
            await GuildStatesController.readWriteMutex.acquire();
        }
        GuildStatesController.readMutex.release();

        // Start reading
        const collection = new Collection<string, GuildStates[Key]>();
        try {
            const result = await GuildStatesModel.find<GuildStates>({}, [
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
        await GuildStatesController.readMutex.acquire();
        GuildStatesController.readCount--;
        if (GuildStatesController.readCount === 0) {
            GuildStatesController.readWriteMutex.release();
        }
        GuildStatesController.readMutex.release();
        return collection;
    }

    private static async _create(guildId: string) {
        // Create new data
        const data = new GuildStatesModel({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: new mongoose.Types.ObjectId(),
            guildId: guildId,
        });

        try {
            return (await data.save()) as GuildStates | null;
        } catch (err) {
            Logging.error(err);
        }
        return null;
    }
}
