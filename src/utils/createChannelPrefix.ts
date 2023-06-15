import type { TextChannel, VoiceChannel } from "discord.js";
import { client } from "../index.js";

const createChannelPrefix = (channelId: string | null) => {
    if (!channelId) return "";
    const channel = client.channels.cache.get(channelId) as
        | TextChannel
        | VoiceChannel
        | undefined;
    if (!channel) return "";
    const channelName = channel.name;
    return `[${channelName} (${channelId})]`;
};

export default createChannelPrefix;
