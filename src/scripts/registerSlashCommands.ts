import type { ApplicationCommandDataResolvable } from "discord.js";
import { REST, Routes } from "discord.js";
import glob from "glob";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import dotenv from "dotenv";
import type { SmoothieCommandType } from "../typings/SmoothieCommand.js";

dotenv.config();

const globPromise = promisify(glob);
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const rest = new REST({ version: "10" }).setToken(process.env.botToken);

const importCommand = async (filePath: string)
                    : Promise<SmoothieCommandType> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const importedObject: unknown = (await import(filePath))?.default;
    const command = importedObject as SmoothieCommandType;
    return command;
};

void (async () => {
    const commands: ApplicationCommandDataResolvable[] = [];

    const commandFiles = await globPromise(
        `${dirName}/../commands/*/*{.ts,.js}`);

    for (const filePath of commandFiles) {
        const command = await importCommand(filePath);
        if (!command.name) return;
        commands.push(command);
    }

    try {
        console.log(`Start refreshing ${commands.length} slash commands...`);

        await rest.put(
            Routes.applicationCommands(process.env.clientId),
            { body: commands },
        );

        if (process.env.environment == "dev" && process.env.guildId) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.clientId,
                    process.env.guildId),
                { body: commands },
            );
        }

        console.log("Refresh successfully.");
    } catch (err) {
        console.error(err);
    }
})();
