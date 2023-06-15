import type { VoiceChannel } from "discord.js";
import { Events } from "discord.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";
import Logging from "../structures/logging/Logging.js";
import { client } from "../index.js";
import GuildStatesHandler from "../structures/database/GuildStatesHandler.js";
import SmoothieVoiceConnection from "../structures/music/SmoothieVoiceConnection.js";

export default new SmoothieEvent(Events.ClientReady, async () => {
    Logging.success("Bot is online.");
    client.user?.setActivity("$play / slash command");
    const guildStates = new GuildStatesHandler(null);
    const collection = await guildStates.getAll("voiceChannelId");
    if (!collection) return;

    collection.forEach((voiceChannelId, guildId) => {
        void (async () => {
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

            // If only the bot is in the voice channel, pause the audio player
            const member = channel.members.first();
            if (!member) return;
            if (channel.members.size === 1 && member.user === client.user) {
                const player = client.audioPlayers.get(guildId);
                player?.pause();
            }
        })();
    });
    return;
});
