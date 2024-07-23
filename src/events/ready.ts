import type { VoiceChannel } from "discord.js";
import { Events } from "discord.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";
import Logging from "../structures/logging/Logging.js";
import { client } from "../index.js";
import SmoothieVoiceConnection from "../structures/music/SmoothieVoiceConnection.js";
import { StatesModel } from "../models/guild/States.js";

export default new SmoothieEvent(Events.ClientReady, async () => {
    Logging.success("Bot is online.");
    client.user?.setActivity("$help / slash command");
    const allStates = await StatesModel.findAll({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: 1,
        guildId: 1,
        voiceChannelId: 1,
    });

    for (const state of allStates) {
        const { guildId, voiceChannelId } = state;
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
    }

    return;
});
