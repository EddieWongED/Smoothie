import { client } from "../index.js";

const createGuildPrefix = (guildId: string | null) => {
    if (!guildId) return "";
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return "";
    const guildName = guild.name;
    return `[${guildName} (${guildId})]`;
};

export default createGuildPrefix;
