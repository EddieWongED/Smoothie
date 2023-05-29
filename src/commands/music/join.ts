import type { GuildMember } from "discord.js";
import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import SmoothieVoiceConnection from "../../structures/music/SmoothieVoiceConnection.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.join, {
    name: Commands.join,
    description: "The bot will join your voice channel.",
    run: async ({ payload, reply }) => {
        const guildId = payload.guildId;
        const adapterCreator = payload.guild?.voiceAdapterCreator;
        if (!guildId || !adapterCreator) return;

        const member = payload.member as GuildMember;
        const voiceChannelId = member.voice.channel?.id;
        if (!voiceChannelId) {
            await reply.error({
                title: "errorTitle",
                description: "notInVoiceChannelMessage",
            });
            return;
        }

        let voiceConnection = client.voiceConnections.get(guildId);
        if (!voiceConnection) {
            voiceConnection = new SmoothieVoiceConnection(
                guildId,
                adapterCreator
            );
            client.voiceConnections.set(guildId, voiceConnection);
        }

        if (!voiceConnection.connect(voiceChannelId)) {
            await reply.error({
                title: "errorTitle",
                description: "joinFailedMessage",
            });
            return;
        }
        await reply.success({
            title: "successTitle",
            description: "joinSuccessMessage",
        });
        return;
    },
});
