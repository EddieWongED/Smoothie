import { client } from "../../index.js";
import type GuildData from "../../typings/models/GuildData.js";

export default class GuildDataHandler {
    constructor(public guildId: string) {}

    async get<Key extends keyof GuildData>(
        key: Key
    ): Promise<GuildData[Key] | null> {
        const guildData = await client.database.guildData.read(this.guildId);
        if (!guildData) return null;
        return guildData[key];
    }

    async update<Key extends keyof GuildData>(
        key: Key,
        value: GuildData[Key]
    ): Promise<GuildData | null> {
        return await client.database.guildData.update(this.guildId, key, value);
    }
}
