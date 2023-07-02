import type { GuildData } from "../../data/guild/GuildData.js";
import GuildDataController from "./GuildDataController.js";

export default class GuildDataHandler {
    constructor(public guildId: string) {}

    async get<Key extends keyof Omit<GuildData, "guildId">>(key: Key) {
        // Perform reading
        const result = await GuildDataController.get(this.guildId, key);
        return result;
    }

    async update<Key extends keyof Omit<GuildData, "guildId">>(
        key: Key,
        value: GuildData[Key]
    ) {
        const result = await GuildDataController.update(
            this.guildId,
            key,
            value
        );
        return result;
    }

    // Usage:
    // 1. const guildData = new GuildDataHandler(guildId);
    // 2. const generator = guildData.getThenUpdate(key);
    // 3. const data = (await generator.next()).value;
    // 4. Update data to newData;
    // 5. If no need to update, await generator.throw(new Error(message));
    // 6. If need to update, await generator.next(newData);
    async *getThenUpdate<Key extends keyof Omit<GuildData, "guildId">>(
        key: Key
    ) {
        yield* GuildDataController.getThenUpdate(this.guildId, key);
    }
}
