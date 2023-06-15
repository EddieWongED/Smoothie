import type { VoiceConnection } from "@discordjs/voice";
import { getVoiceConnection } from "@discordjs/voice";
import { VoiceConnectionStatus } from "@discordjs/voice";
import { joinVoiceChannel } from "@discordjs/voice";
import { client } from "../../index.js";
import Logging from "../logging/Logging.js";
import createGuildPrefix from "../../utils/createGuildPrefix.js";
import createChannelPrefix from "../../utils/createChannelPrefix.js";
import SmoothieAudioPlayer from "./SmoothieAudioPlayer.js";
import GuildStatesHandler from "../database/GuildStatesHandler.js";

export default class SmoothieVoiceConnection {
    channelId: string | null = null;
    connection: VoiceConnection | undefined = undefined;
    player: SmoothieAudioPlayer;
    private _guildStates: GuildStatesHandler;

    constructor(public guildId: string) {
        this.player = new SmoothieAudioPlayer(guildId);
        client.audioPlayers.set(guildId, this.player);
        this._guildStates = new GuildStatesHandler(guildId);
    }

    async connect(channelId: string): Promise<boolean> {
        const guildPrefix = createGuildPrefix(this.guildId);
        const channelPrefix = createChannelPrefix(channelId);

        this.connection = getVoiceConnection(this.guildId);
        if (this.connection) {
            // Join from another voice channel
            this.connection.removeAllListeners();
        }

        const adapter = client.guilds.cache.get(
            this.guildId
        )?.voiceAdapterCreator;
        if (!adapter) return false;

        this.connection = joinVoiceChannel({
            guildId: this.guildId,
            channelId: channelId,
            adapterCreator: adapter,
            selfDeaf: true,
        });

        // When Smoothie is connecting the voice channel
        this.connection.on(VoiceConnectionStatus.Connecting, () => {
            Logging.info(
                guildPrefix,
                channelPrefix,
                `Smoothie is connecting to the voice channel.`
            );
            return;
        });

        // When Smoothie joins the voice channel
        this.connection.on(VoiceConnectionStatus.Ready, () => {
            Logging.success(
                guildPrefix,
                channelPrefix,
                `Smoothie has joined to the voice channel.`
            );
            return;
        });

        // Start the audio player
        await this.player.start();
        this.connection.subscribe(this.player.player);

        this.channelId = channelId;

        // Update database voiceChannelId
        await this._guildStates.update("voiceChannelId", channelId);
        return true;
    }

    async disconnect() {
        if (!this.connection) return true;
        this.connection.destroy();
        this.connection = undefined;
        this.channelId = null;
        await this._guildStates.update("voiceChannelId", null);
        return true;
    }
}
