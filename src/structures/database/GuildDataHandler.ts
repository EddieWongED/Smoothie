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
}
