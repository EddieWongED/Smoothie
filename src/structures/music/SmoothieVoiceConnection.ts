import type { VoiceConnection } from "@discordjs/voice";
import { getVoiceConnection } from "@discordjs/voice";
import { VoiceConnectionStatus } from "@discordjs/voice";
import { joinVoiceChannel } from "@discordjs/voice";
import { client } from "../../index.js";
import Logging from "../logging/Logging.js";
import createGuildPrefix from "../../utils/createGuildPrefix.js";
import createChannelPrefix from "../../utils/createChannelPrefix.js";
import SmoothieAudioPlayer from "./SmoothieAudioPlayer.js";
import type { VoiceChannel } from "discord.js";
import type { SetIntervalAsyncTimer } from "set-interval-async";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";
import { StatesModel } from "../../models/guild/States.js";
import { UserStatsModel } from "../../models/user/UserStats.js";

export default class SmoothieVoiceConnection {
    channelId: string | null = null;
    connection: VoiceConnection | undefined = undefined;
    player: SmoothieAudioPlayer;
    private _stayTimer?: SetIntervalAsyncTimer<unknown[]>;
    private _prevTime: DOMHighResTimeStamp;

    constructor(public guildId: string) {
        this.player = new SmoothieAudioPlayer(guildId);
        client.audioPlayers.set(guildId, this.player);
        this._prevTime = performance.now();
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
        await StatesModel.findAndSetVoiceChannelId(this.guildId, channelId);

        // Start user staying count
        this._startStayingTimer();
        return true;
    }

    async disconnect() {
        if (!this.connection) return true;
        this.connection.destroy();
        this.connection = undefined;
        this.channelId = null;
        if (this._stayTimer) {
            await clearIntervalAsync(this._stayTimer);
        }
        await StatesModel.findAndSetVoiceChannelId(this.guildId, null);
        return true;
    }

    private _startStayingTimer() {
        this._prevTime = performance.now();
        this._stayTimer = setIntervalAsync(async () => {
            const now = performance.now();
            const timeElapsed = (now - this._prevTime) / 1000;
            this._prevTime = now;

            if (!this.channelId) return;
            const channel = client.channels.cache.get(
                this.channelId
            ) as VoiceChannel | null;
            if (!channel) return;

            const userIds = channel.members
                .filter((member) => member.user !== client.user)
                .map((member) => member.user.id);

            if (userIds.length === 0) return;

            // Retrieve userStats
            for (const userId of userIds) {
                const userStats = await UserStatsModel.findByGuildIdAndUserId(
                    this.guildId,
                    userId
                );
                if (!userStats) {
                    continue;
                }
                await userStats.incrementStayDurationAndSave(timeElapsed);
            }
        }, 30000);
    }
}
