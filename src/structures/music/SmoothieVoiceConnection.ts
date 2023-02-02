import type { DiscordGatewayAdapterCreator } from "@discordjs/voice";
import { getVoiceConnection } from "@discordjs/voice";
import { VoiceConnectionStatus } from "@discordjs/voice";
import { joinVoiceChannel } from "@discordjs/voice";
import type { VoiceChannel } from "discord.js";
import { client } from "../../index.js";
import GuildLogging from "../logging/GuildLogging.js";

export default class SmoothieVoiceConnection {
    channelId: string | null = null;
    guildLogging: GuildLogging;

    constructor(
        public guildId: string,
        public adapterCreator: DiscordGatewayAdapterCreator
    ) {
        this.guildLogging = new GuildLogging(this.guildId);
    }

    connect(channelId: string): boolean {
        let connection = getVoiceConnection(this.guildId);
        if (connection) {
            // Join from another voice channel
            connection.removeAllListeners();
        }

        connection = joinVoiceChannel({
            guildId: this.guildId,
            channelId: channelId,
            adapterCreator: this.adapterCreator,
            selfDeaf: true,
        });

        const channel = client.channels.cache.get(channelId) as
            | VoiceChannel
            | undefined;
        const channelName = channel?.name ?? "";

        // When Smoothie is connecting the voice channel
        connection.on(VoiceConnectionStatus.Connecting, () => {
            this.guildLogging.info(
                `Smoothie is connecting to the voice channel ${channelName} (${channelId}).`
            );
            return;
        });

        // When Smoothie joins the voice channel
        connection.on(VoiceConnectionStatus.Ready, () => {
            this.guildLogging.info(
                `Smoothie has joined to the voice channel ${channelName} (${channelId}).`
            );
            return;
        });

        this.channelId = channelId;
        return true;
    }

    disconnect(): boolean {
        const connection = getVoiceConnection(this.guildId);
        if (!connection) return true;
        connection.destroy();
        this.channelId = null;
        return true;
    }
}
