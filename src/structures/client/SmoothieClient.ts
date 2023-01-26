import type { ClientEvents } from "discord.js";
import type { SmoothieCommandTypes } from "../../typings/structures/commands/SmoothieCommand.js";
import type { SmoothieEvent } from "../events/SmoothieEvent.js";

import path from "path";
import { fileURLToPath } from "url";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { promisify } from "util";
import glob from "glob";
import { CommandHandler } from "../commands/CommandHandler.js";

const globPromise = promisify(glob);
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

export class SmoothieClient extends Client {
    commands = new Collection<string, SmoothieCommandTypes>();
    commandHandler = new CommandHandler();

    constructor() {
        super({ intents: [GatewayIntentBits.Guilds] });
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
        console.log("Start registering events...");
        eventFiles.forEach((filePath) => {
            void (async () => {
                const event = await this._importEvent(filePath);
                if (!event) return;
                this.on(event.event, event.run);
                console.log(`${event.event} event is registered.`);
            })();
        });
    }

    private async _loadCommands() {
        const commandFiles = await globPromise(
            `${dirName}/../../commands/*/*{.ts,.js}`
        );
        for (const filePath of commandFiles) {
            const command = await this._importCommand(filePath);
            if (!command) break;
            this.commands.set(command.name, command);
        }
    }
}
