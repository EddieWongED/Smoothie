import { Events } from "discord.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";
import { client } from "../index.js";

export default new SmoothieEvent(
    Events.VoiceStateUpdate,
    (oldState, newState) => {
        const channel = oldState.channel ? oldState.channel : newState.channel;
        const guildId = oldState.guild.id;
        if (!channel) return;

        const members = channel.members;
        const member = members.first();
        if (!member) return;

        const player = client.audioPlayers.get(guildId);
        if (channel.members.size === 1 && member.user === client.user) {
            // If only the bot is in the voice channel, pause the audio player
            player?.pause();
        } else if (
            channel.members.size > 1 &&
            channel.members.some((member) => member.user === client.user)
        ) {
            // If someone is in the voice channel, unpause the audio player
            player?.unpause();
        }

        return;
    }
);
