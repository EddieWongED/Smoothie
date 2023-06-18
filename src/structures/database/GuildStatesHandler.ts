import type { GuildStates } from "../../data/guild/GuildStates.js";
import GuildStatesController from "./GuildStatesController.js";

export default class GuildStatesHandler {
    constructor(public guildId: string) {}

    async get<Key extends keyof Omit<GuildStates, "guildId">>(key: Key) {
        // Perform reading
        const result = await GuildStatesController.get(this.guildId, key);
        return result;
    }

    async update<Key extends keyof Omit<GuildStates, "guildId">>(
        key: Key,
        value: GuildStates[Key]
    ) {
        const result = await GuildStatesController.update(
            this.guildId,
            key,
            value
        );
        return result;
    }
}
