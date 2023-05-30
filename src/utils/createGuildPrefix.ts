import { client } from "../index.js";

const createGuildPrefix = (guildId: string) => {
    const guild = client.guilds.cache.get(guildId);
    const guildName = guild?.name ?? "";
    return `[${guildName} (${guildId})]`;
};

export default createGuildPrefix;
