import type { ClientEvents } from "discord.js";
import type { Command } from "../../typings/structures/commands/SmoothieCommand.js";
import type { SmoothieEvent } from "../events/SmoothieEvent.js";

import { Client, Collection, GatewayIntentBits } from "discord.js";
import Logging from "../logging/Logging.js";
import Database from "../database/Database.js";
import type SmoothieVoiceConnection from "../music/SmoothieVoiceConnection.js";
import importDefault from "../../utils/importDefault.js";
import subfilePathsOf from "../../utils/subfilePathsOf.js";
import type SmoothieAudioPlayer from "../music/SmoothieAudioPlayer.js";
import { setToken } from "play-dl";

export class SmoothieClient extends Client {
    commands = new Collection<string, Command>();
    voiceConnections = new Collection<string, SmoothieVoiceConnection>();
    audioPlayers = new Collection<string, SmoothieAudioPlayer>();
    database = new Database();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
    }

    async start() {
        await Promise.all([
            this._loadCommands(),
            this._registerEvents(),
            this.database.connect(),
        ]);
        if (process.env.YOUTUBE_COOKIE) {
            await setToken({ youtube: { cookie: process.env.YOUTUBE_COOKIE } });
            Logging.info(
                "YouTube cookie is given. It will be used when fetching data from YouTube."
            );
        }
        await this.login(process.env.BOT_TOKEN);
    }

    private async _registerEvents() {
        const paths = await subfilePathsOf("events");
        Logging.info("Start registering events...");
        let successCount = 0;
        for (const path of paths) {
            try {
                const event = await importDefault<
                    SmoothieEvent<keyof ClientEvents>
                >(path);
                if (!event) return;
                Logging.success(`Registering ${event.event} event...`);
                this.on(event.event, event.run);
                Logging.info(`${event.event} event is registered.`);
                successCount++;
            } catch (err) {
                Logging.error(err);
            }
        }
        Logging.success(`Loaded ${successCount}/${paths.length} events.`);
    }

    private async _loadCommands() {
        const paths = await subfilePathsOf("commands");
        Logging.info("Start loading commands...");
        let successCount = 0;
        for (const path of paths) {
            try {
                const command = await importDefault<Command>(path);
                if (!command) break;
                Logging.info(`Loading ${command.name} command...`);
                if (command.aliases) {
                    for (const alias of command.aliases) {
                        this.commands.set(alias, command);
                    }
                }
                this.commands.set(command.name, command);
                Logging.success(
                    `${command.name} command (${
                        command.aliases?.length ?? 0
                    } alias(es)) is loaded.`
                );
                successCount++;
            } catch (err) {
                Logging.error(err);
            }
        }
        Logging.success(`Loaded ${successCount}/${paths.length} commands.`);
    }
}
