import { Collection } from "discord.js";
import type { GuildStates } from "../../data/guild/GuildStates.js";
import GuildStatesModel from "../../models/GuildStatesModel.js";
import Logging from "../logging/Logging.js";
import type { MutexInterface } from "async-mutex";
import { Mutex, withTimeout } from "async-mutex";
import mongoose from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class GuildStatesController {
    static readWriteMutex: MutexInterface = withTimeout(new Mutex(), 3000);
    static readMutex: MutexInterface = withTimeout(new Mutex(), 3000);
    static readCount = 0;
    private static _prefix = "[GuildStatesController]";

    static async get<Key extends keyof Omit<GuildStates, "guildId">>(
        guildId: string,
        key: Key
    ) {
        // Readers–writers problem
        // Acquire resource lock
        try {
            await GuildStatesController.readMutex.acquire();
        } catch (err) {
            GuildStatesController.readMutex.release();
            return null;
        }

        GuildStatesController.readCount++;
        if (GuildStatesController.readCount === 1) {
            try {
                await GuildStatesController.readWriteMutex.acquire();
                Logging.debug(
                    this._prefix,
                    `Acquired resource mutex for reading "${key}" resource.`
                );
            } catch (err) {
                GuildStatesController.readCount--;
                GuildStatesController.readWriteMutex.release();
                Logging.debug(
                    this._prefix,
                    `Released resource mutex for reading "${key}" resource because of timeout.`
                );
                return null;
            }
        }

        GuildStatesController.readMutex.release();

        // Start reading
        let data: GuildStates | null = null;
        try {
            data = await GuildStatesModel.findOne<GuildStates>(
                {
                    guildId: guildId,
                },
                [key]
            ).exec();
            if (!data) {
                data = await GuildStatesController._create(guildId);
            }
        } catch (err) {
            Logging.error(err);
        }

        // Release resource lock
        try {
            await GuildStatesController.readMutex.acquire();
        } catch (err) {
            GuildStatesController.readMutex.release();
            return null;
        }

        GuildStatesController.readCount--;
        if (GuildStatesController.readCount === 0) {
            GuildStatesController.readWriteMutex.release();
            Logging.debug(
                this._prefix,
                `Released resource mutex for reading "${key}" resource.`
            );
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
        try {
            await GuildStatesController.readWriteMutex.acquire();
            Logging.debug(
                this._prefix,
                `Acquired resource mutex for updating "${key}" resource.`
            );
        } catch (err) {
            GuildStatesController.readWriteMutex.release();
            Logging.debug(
                this._prefix,
                `Released resource mutex for updating "${key}" resource because of timeout.`
            );
            return null;
        }

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
        Logging.debug(
            this._prefix,
            `Released resource mutex for updating "${key}" resource.`
        );
        return data;
    }

    static async remove(guildId: string) {
        // Acquire resource lock
        try {
            await GuildStatesController.readWriteMutex.acquire();
        } catch (err) {
            GuildStatesController.readWriteMutex.release();
            return null;
        }

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
        try {
            await GuildStatesController.readMutex.acquire();
        } catch (err) {
            GuildStatesController.readMutex.release();
            return null;
        }

        GuildStatesController.readCount++;
        if (GuildStatesController.readCount === 1) {
            try {
                await GuildStatesController.readWriteMutex.acquire();
                Logging.debug(
                    this._prefix,
                    `Acquired resource mutex for reading all "${key}" resource.`
                );
            } catch (err) {
                GuildStatesController.readCount--;
                GuildStatesController.readWriteMutex.release();
                Logging.debug(
                    this._prefix,
                    `Released resource mutex for reading all "${key}" resource because of timeout.`
                );
                return null;
            }
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
        try {
            await GuildStatesController.readMutex.acquire();
        } catch (err) {
            Logging.warn("GuildStatesController read mutex Timeout.");
            GuildStatesController.readMutex.release();
            return null;
        }

        GuildStatesController.readCount--;
        if (GuildStatesController.readCount === 0) {
            GuildStatesController.readWriteMutex.release();
            Logging.debug(
                this._prefix,
                `Released resource mutex for reading all "${key}" resource.`
            );
        }
        GuildStatesController.readMutex.release();
        return collection;
    }

    static async *getThenUpdate<Key extends keyof Omit<GuildStates, "guildId">>(
        guildId: string,
        key: Key
    ) {
        // Acquire resource lock
        try {
            await GuildStatesController.readWriteMutex.acquire();
            Logging.debug(
                this._prefix,
                `Acquired resource mutex for reading then updating "${key}" resource.`
            );
        } catch (err) {
            GuildStatesController.readWriteMutex.release();
            Logging.debug(
                this._prefix,
                `Released resource mutex for reading then updating "${key}" resource because of timeout.`
            );
            return null;
        }

        // Start reading
        let data: GuildStates | null = null;
        try {
            data = await GuildStatesModel.findOne<GuildStates>(
                {
                    guildId: guildId,
                },
                [key]
            ).exec();
            if (!data) {
                data = await GuildStatesController._create(guildId);
            }
        } catch (err) {
            Logging.error(err);
        }

        const value = data ? data[key] : null;
        let newData: GuildStates[Key];
        try {
            newData = (yield value) as GuildStates[Key];
        } catch (err) {
            GuildStatesController.readWriteMutex.release();
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
            data = await GuildStatesModel.findOneAndUpdate<GuildStates>(
                { guildId: guildId },
                { $set: { [key]: newData } },
                { returnOriginal: false, upsert: true }
            ).exec();
        } catch (err) {
            Logging.error(err);
        }

        // Release resource lock
        GuildStatesController.readWriteMutex.release();
        Logging.debug(
            this._prefix,
            `Released resource mutex for reading then updating "${key}" resource.`
        );
        return;
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
