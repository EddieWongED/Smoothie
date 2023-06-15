import { Collection } from "discord.js";
import type { GuildStates } from "../../data/guild/GuildStates.js";
import { client } from "../../index.js";
import type { MutexInterface } from "async-mutex";
import { Mutex, withTimeout } from "async-mutex";

export default class GuildStatesHandler {
    readWriteMutex: MutexInterface = new Mutex();
    readMutex: MutexInterface = new Mutex();
    readCount = 0;

    constructor(public guildId: string | null) {
        this.readWriteMutex = withTimeout(this.readWriteMutex, 2000);
        this.readMutex = withTimeout(this.readMutex, 2000);
    }

    async get<Key extends keyof GuildStates>(
        key: Key
    ): Promise<GuildStates[Key] | null> {
        // Readers–writers problem
        // Acquire resource lock
        await this.readMutex.acquire();
        this.readCount++;
        if (this.readCount === 1) {
            await this.readWriteMutex.acquire();
        }
        this.readMutex.release();

        // Perform reading
        const guildStates = await client.database.guildStates.read(
            this.guildId
        );
        if (!guildStates) return null;
        const result = guildStates[key];

        // Release resource lock
        await this.readMutex.acquire();
        this.readCount--;
        if (this.readCount === 0) {
            this.readWriteMutex.release();
        }
        this.readMutex.release();
        return result;
    }

    async update<Key extends keyof GuildStates>(
        key: Key,
        value: GuildStates[Key]
    ): Promise<GuildStates | null> {
        // Acquire resource lock
        await this.readWriteMutex.acquire();

        const result = await client.database.guildStates.update(
            this.guildId,
            key,
            value
        );

        // Release resource lock
        this.readWriteMutex.release();
        return result;
    }

    async getAll<Key extends keyof GuildStates>(key: Key) {
        // Readers–writers problem
        // Acquire resource lock
        await this.readMutex.acquire();
        this.readCount++;
        if (this.readCount === 1) {
            await this.readWriteMutex.acquire();
        }
        this.readMutex.release();

        // Perform reading
        const result = await client.database.guildStates.readAll(key);
        if (!result) return null;
        const collection = new Collection<string, string>();
        result.forEach((guildStates) => {
            if (guildStates.voiceChannelId) {
                collection.set(guildStates.guildId, guildStates.voiceChannelId);
            }
        });

        // Release resource lock
        await this.readMutex.acquire();
        this.readCount--;
        if (this.readCount === 0) {
            this.readWriteMutex.release();
        }
        this.readMutex.release();
        return collection;
    }
}
