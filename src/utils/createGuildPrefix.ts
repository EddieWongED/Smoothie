import { client } from "../index.js";

const createGuildPrefix = (guildId: string | null) => {
    if (!guildId) return "";
    const guild = client.guilds.cache.get(guildId);
    const guildName = guild?.name;
    if (!guildName) return "";
    return `[${guildName} (${guildId})]`;
};

export default createGuildPrefix;
