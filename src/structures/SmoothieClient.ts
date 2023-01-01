import type { ClientEvents,
    ApplicationCommandDataResolvable } from "discord.js";
import { Client, Collection } from "discord.js";
import type { SmoothieCommandType } from "../typings/SmoothieCommand.js";
import glob from "glob";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import type { SmoothieEvent } from "./SmoothieEvent.js";

const globPromise = promisify(glob);

export class SmoothieClient extends Client {
    commands = new Collection<string, SmoothieCommandType>();
    fileName = fileURLToPath(import.meta.url);
    dirName = path.dirname(this.fileName);

    constructor() {
        super({ intents: 8 });
    }

    async start() {
        await this._registerModules();
        await this.login(process.env.botToken);
    }

    private async _importCommand(filePath: string)
                    : Promise<SmoothieCommandType> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const importedObject: unknown = (await import(filePath))?.default;
        const command = importedObject as SmoothieCommandType;
        return command;
    }

    private async _importEvent(filePath: string):
                            Promise<SmoothieEvent<keyof ClientEvents>> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const importedObject: unknown = (await import(filePath))?.default;
        const event = importedObject as SmoothieEvent<keyof ClientEvents>;
        return event;
    }

    private async _registerEvents() {
        const eventFiles = await globPromise(
            `${this.dirName}/../events/*{.ts,.js}`);
        eventFiles.forEach((filePath) => {
            void (async () =>{
                const event = await this._importEvent(filePath);
                this.on(event.event, event.run);
            })();
        });
    }

    private async _registerCommands() {
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await globPromise(
            `${this.dirName}/../commands/*/*{.ts,.js}`);
        commandFiles.forEach((filePath) => {
            void (async () =>{
                console.log(filePath);
                const command = await this._importCommand(filePath);
                if (!command.name) return;
                this.commands.set(command.name, command);
                slashCommands.push(command);
            })();
        });
        await this.application?.commands.set(slashCommands);
        console.log("Registered global commands.");
    }

    private async _registerModules() {
        await this._registerCommands();
        await this._registerEvents();
    }
}
