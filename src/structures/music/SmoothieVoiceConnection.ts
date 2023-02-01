import type { DiscordGatewayAdapterCreator } from "@discordjs/voice";
import { getVoiceConnection } from "@discordjs/voice";
import { VoiceConnectionStatus } from "@discordjs/voice";
import { joinVoiceChannel } from "@discordjs/voice";
import type { VoiceChannel } from "discord.js";
import { client } from "../../index.js";
import Logging from "../logging/Logging.js";

export default class SmoothieVoiceConnection {
    channelId: string | null = null;

    constructor(
        public guildId: string,
        public adapterCreator: DiscordGatewayAdapterCreator
    ) {}

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

        const guild = client.guilds.cache.get(this.guildId);
        const guildName = guild?.name ?? "";
        const channel = client.channels.cache.get(channelId) as
            | VoiceChannel
            | undefined;
        const channelName = channel?.name ?? "";

        // When Smoothie is connecting the voice channel
        connection.on(VoiceConnectionStatus.Connecting, () => {
            Logging.info(
                `[${guildName} (${this.guildId})] Smoothie is connecting to the voice channel ${channelName} (${channelId}).`
            );
            return;
        });

        // When Smoothie joins the voice channel
        connection.on(VoiceConnectionStatus.Ready, () => {
            Logging.info(
                `[${guildName} (${this.guildId})] Smoothie has joined to the voice channel ${channelName} (${channelId}).`
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
