import type { GuildMember } from "discord.js";
import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import SmoothieVoiceConnection from "../../structures/music/SmoothieVoiceConnection.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.join, {
    name: Commands.join,
    description: getLocale(defaultLanguage, "joinDescription"),
    descriptionLocalizations: getLocalizationMap("joinDescription"),
    run: async ({ guildId, payload, reply }) => {
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
            voiceConnection = new SmoothieVoiceConnection(guildId);
            client.voiceConnections.set(guildId, voiceConnection);
        }

        if (!(await voiceConnection.connect(voiceChannelId))) {
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
