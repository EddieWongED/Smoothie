import { Collection } from "discord.js";
import type { GuildData } from "../../data/guild/GuildData.js";
import GuildDataModel from "../../models/GuildDataModel.js";
import Logging from "../logging/Logging.js";
import type { MutexInterface } from "async-mutex";
import { Mutex, withTimeout } from "async-mutex";
import mongoose from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class GuildDataController {
    static readWriteMutex: MutexInterface = withTimeout(new Mutex(), 3000);
    static readMutex: MutexInterface = withTimeout(new Mutex(), 3000);
    static readCount = 0;
    private static _prefix = "[GuildDataController]";

    static async get<Key extends keyof Omit<GuildData, "guildId">>(
        guildId: string,
        key: Key
    ) {
        // Readers–writers problem
        // Acquire resource lock
        try {
            await GuildDataController.readMutex.acquire();
        } catch (err) {
            GuildDataController.readMutex.release();
            return null;
        }

        GuildDataController.readCount++;
        if (GuildDataController.readCount === 1) {
            try {
                await GuildDataController.readWriteMutex.acquire();
                Logging.debug(
                    this._prefix,
                    `Acquired resource mutex for reading "${key}" resource.`
                );
            } catch (err) {
                GuildDataController.readCount--;
                GuildDataController.readWriteMutex.release();
                Logging.debug(
                    this._prefix,
                    `Released resource mutex for reading "${key}" resource because of timeout.`
                );
                return null;
            }
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
        try {
            await GuildDataController.readMutex.acquire();
        } catch (err) {
            GuildDataController.readMutex.release();
            return null;
        }

        GuildDataController.readCount--;
        if (GuildDataController.readCount === 0) {
            GuildDataController.readWriteMutex.release();
            Logging.debug(
                this._prefix,
                `Released resource mutex for reading "${key}" resource.`
            );
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
        try {
            await GuildDataController.readWriteMutex.acquire();
            Logging.debug(
                this._prefix,
                `Acquired resource mutex for updating "${key}" resource.`
            );
        } catch (err) {
            GuildDataController.readWriteMutex.release();
            Logging.debug(
                this._prefix,
                `Released resource mutex for updating "${key}" resource because of timeout.`
            );
            return null;
        }

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
        Logging.debug(
            this._prefix,
            `Released resource mutex for updating "${key}" resource.`
        );
        return data;
    }

    static async remove(guildId: string) {
        // Acquire resource lock
        try {
            await GuildDataController.readWriteMutex.acquire();
        } catch (err) {
            GuildDataController.readWriteMutex.release();
            return null;
        }

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
        try {
            await GuildDataController.readMutex.acquire();
        } catch (err) {
            GuildDataController.readMutex.release();
            return null;
        }

        GuildDataController.readCount++;
        if (GuildDataController.readCount === 1) {
            try {
                await GuildDataController.readWriteMutex.acquire();
                Logging.debug(
                    this._prefix,
                    `Acquired resource mutex for reading all "${key}" resource.`
                );
            } catch (err) {
                GuildDataController.readCount--;
                GuildDataController.readWriteMutex.release();
                Logging.debug(
                    this._prefix,
                    `Released resource mutex for reading all "${key}" resource because of timeout.`
                );
                return null;
            }
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
        try {
            await GuildDataController.readMutex.acquire();
        } catch (err) {
            Logging.warn("GuildDataController read mutex Timeout.");
            GuildDataController.readMutex.release();
            return null;
        }

        GuildDataController.readCount--;
        if (GuildDataController.readCount === 0) {
            GuildDataController.readWriteMutex.release();
            Logging.debug(
                this._prefix,
                `Released resource mutex for reading all "${key}" resource.`
            );
        }
        GuildDataController.readMutex.release();
        return collection;
    }

    static async *getThenUpdate<Key extends keyof Omit<GuildData, "guildId">>(
        guildId: string,
        key: Key
    ) {
        // Acquire resource lock
        try {
            await GuildDataController.readWriteMutex.acquire();
            Logging.debug(
                this._prefix,
                `Acquired resource mutex for reading then updating "${key}" resource.`
            );
        } catch (err) {
            GuildDataController.readWriteMutex.release();
            Logging.debug(
                this._prefix,
                `Released resource mutex for reading then updating "${key}" resource because of timeout.`
            );
            return null;
        }

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

        const value = data ? data[key] : null;
        let newData: GuildData[Key];
        try {
            newData = (yield value) as GuildData[Key];
        } catch (err) {
            GuildDataController.readWriteMutex.release();
            if (err instanceof Error) {
                Logging.debug(
                    this._prefix,
                    `Released resource mutex for reading then updating "${key}" resource. Reason: ${err.message}`
                );
            }
            return;
        }

        // Start writing
        try {
            data = await GuildDataModel.findOneAndUpdate<GuildData>(
                { guildId: guildId },
                { $set: { [key]: newData } },
                { returnOriginal: false, upsert: true }
            ).exec();
        } catch (err) {
            Logging.error(err);
        }

        // Release resource lock
        GuildDataController.readWriteMutex.release();
        Logging.debug(
            this._prefix,
            `Released resource mutex for reading then updating "${key}" resource.`
        );
        return;
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
