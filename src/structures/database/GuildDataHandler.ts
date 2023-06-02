import type { GuildData } from "../../data/guild/GuildData.js";
import { client } from "../../index.js";
import type { MutexInterface } from "async-mutex";
import { Mutex, withTimeout } from "async-mutex";

export default class GuildDataHandler {
    readWriteMutex: MutexInterface = new Mutex();
    readMutex: MutexInterface = new Mutex();
    readCount = 0;

    constructor(public guildId: string) {
        this.readWriteMutex = withTimeout(this.readWriteMutex, 2000);
        this.readMutex = withTimeout(this.readMutex, 2000);
    }

    async get<Key extends keyof GuildData>(
        key: Key
    ): Promise<GuildData[Key] | null> {
        // Readers–writers problem
        // Acquire resource lock
        await this.readMutex.acquire();
        this.readCount++;
        if (this.readCount === 1) {
            await this.readWriteMutex.acquire();
        }
        this.readMutex.release();

        // Perform reading
        const guildData = await client.database.guildData.read(this.guildId);
        if (!guildData) return null;
        const result = guildData[key];

        // Release resource lock
        await this.readMutex.acquire();
        this.readCount--;
        if (this.readCount === 0) {
            this.readWriteMutex.release();
        }
        this.readMutex.release();
        return result;
    }

    async update<Key extends keyof GuildData>(
        key: Key,
        value: GuildData[Key]
    ): Promise<GuildData | null> {
        // Acquire resource lock
        await this.readWriteMutex.acquire();

        const result = await client.database.guildData.update(
            this.guildId,
            key,
            value
        );

        // Release resource lock
        this.readWriteMutex.release();
        return result;
    }
}
