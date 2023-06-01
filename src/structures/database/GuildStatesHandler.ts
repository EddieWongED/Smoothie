import type { GuildStates } from "../../data/guild/GuildStates.js";
import { client } from "../../index.js";

export default class GuildStatesHandler {
    constructor(public guildId: string) {}

    async get<Key extends keyof GuildStates>(
        key: Key
    ): Promise<GuildStates[Key] | null> {
        const guildStates = await client.database.guildStates.read(
            this.guildId
        );
        if (!guildStates) return null;
        return guildStates[key];
    }

    async update<Key extends keyof GuildStates>(
        key: Key,
        value: GuildStates[Key]
    ): Promise<GuildStates | null> {
        return await client.database.guildStates.update(
            this.guildId,
            key,
            value
        );
    }
}
