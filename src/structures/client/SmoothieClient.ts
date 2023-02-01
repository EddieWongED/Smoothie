import type { ClientEvents } from "discord.js";
import type { SmoothieCommandTypes } from "../../typings/structures/commands/SmoothieCommand.js";
import type { SmoothieEvent } from "../events/SmoothieEvent.js";

import path from "path";
import { fileURLToPath } from "url";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { promisify } from "util";
import glob from "glob";
import { CommandHandler } from "../commands/CommandHandler.js";
import Logging from "../logging/Logging.js";
import Database from "../database/Database.js";
import type SmoothieVoiceConnection from "../music/SmoothieVoiceConnection.js";

const globPromise = promisify(glob);
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

export class SmoothieClient extends Client {
    commands = new Collection<string, SmoothieCommandTypes>();
    voiceConnections = new Collection<string, SmoothieVoiceConnection>();
    commandHandler = new CommandHandler();
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
        await this._loadCommands();
        await this._registerEvents();
        await this.login(process.env.botToken);
    }

    private async _importCommand(
        filePath: string
    ): Promise<SmoothieCommandTypes | null> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const importedObject: unknown = (await import(filePath))?.default;
            const command = importedObject as SmoothieCommandTypes;
            return command;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    private async _importEvent(
        filePath: string
    ): Promise<SmoothieEvent<keyof ClientEvents> | null> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const importedObject: unknown = (await import(filePath))?.default;
            const event = importedObject as SmoothieEvent<keyof ClientEvents>;
            return event;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    private async _registerEvents() {
        const eventFiles = await globPromise(
            `${dirName}/../../events/*{.ts,.js}`
        );
        Logging.info("Start registering events...");
        eventFiles.forEach((filePath) => {
            void (async () => {
                const event = await this._importEvent(filePath);
                if (!event) return;
                Logging.info(`Registering ${event.event} event...`);
                this.on(event.event, event.run);
                Logging.info(`${event.event} event is registered.`);
            })();
        });
    }

    private async _loadCommands() {
        const commandFiles = await globPromise(
            `${dirName}/../../commands/*/*{.ts,.js}`
        );
        Logging.info("Start loading commands...");
        for (const filePath of commandFiles) {
            const command = await this._importCommand(filePath);
            if (!command) break;
            if (command.aliases) {
                for (const alias of command.aliases) {
                    this.commands.set(alias, command);
                }
            }
            this.commands.set(command.name, command);
            Logging.info(
                `${command.name} command (${
                    command.aliases?.length ?? 0
                } alias(es)) is loaded.`
            );
        }
        Logging.info(
            `Loaded all the commands (total: ${commandFiles.length}).`
        );
    }
}
