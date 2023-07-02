import type { VoiceChannel } from "discord.js";
import { Events } from "discord.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";
import Logging from "../structures/logging/Logging.js";
import { client } from "../index.js";
import SmoothieVoiceConnection from "../structures/music/SmoothieVoiceConnection.js";
import GuildStatesController from "../structures/database/GuildStatesController.js";

export default new SmoothieEvent(Events.ClientReady, async () => {
    Logging.success("Bot is online.");
    client.user?.setActivity("$help / slash command");
    const collection = await GuildStatesController.getAll("voiceChannelId");

    if (!collection) return;

    collection.forEach((voiceChannelId, guildId) => {
        void (async () => {
            if (!voiceChannelId) return;
            // Fetch the voice channel
            const channel = client.channels.cache.get(
                voiceChannelId
            ) as VoiceChannel | null;
            if (!channel) return;

            // Automatically connect the bot to the voice channel if the bot has restarted
            let voiceConnection = client.voiceConnections.get(guildId);
            if (!voiceConnection) {
                voiceConnection = new SmoothieVoiceConnection(guildId);
                client.voiceConnections.set(guildId, voiceConnection);
            }
            await voiceConnection.connect(voiceChannelId);
        })();
    });
    return;
});
