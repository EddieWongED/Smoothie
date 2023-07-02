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

    // Usage:
    // 1. const guildStates = new GuildStatesHandler(guildId);
    // 2. const generator = guildStates.getThenUpdate(key);
    // 3. const data = (await generator.next()).value;
    // 4. Update data to newData;
    // 5. If no need to update, await generator.throw(new Error(message));
    // 6. If need to update, await generator.next(newData);
    async *getThenUpdate<Key extends keyof Omit<GuildStates, "guildId">>(
        key: Key
    ) {
        yield* GuildStatesController.getThenUpdate(this.guildId, key);
    }
}
