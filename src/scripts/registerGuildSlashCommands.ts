import type { ApplicationCommandDataResolvable } from "discord.js";
import { REST, Routes } from "discord.js";
import glob from "glob";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import dotenv from "dotenv";
import type { SmoothieCommandTypes } from "../typings/structures/commands/SmoothieCommand.js";

dotenv.config();

const globPromise = promisify(glob);
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const rest = new REST({ version: "10" }).setToken(process.env.botToken);

const importCommand = async (
    filePath: string
): Promise<SmoothieCommandTypes> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const importedObject: unknown = (await import(filePath))?.default;
    const command = importedObject as SmoothieCommandTypes;
    return command;
};

void (async () => {
    if (!process.env.guildId) {
        console.log("Please specify your guildId in .env file!");
        return;
    }
    if (!process.env.clientId) {
        console.log("Please specify your clientId in .env file!");
        return;
    }

    const commands: ApplicationCommandDataResolvable[] = [];

    const commandFiles = await globPromise(
        `${dirName}/../commands/*/*{.ts,.js}`
    );

    for (const filePath of commandFiles) {
        const command = await importCommand(filePath);
        if (!command.name) return;
        commands.push(command);
    }

    console.log(`Start refreshing ${commands.length} guild slash commands...`);

    await rest.put(
        Routes.applicationGuildCommands(
            process.env.clientId,
            process.env.guildId
        ),
        { body: commands }
    );

    console.log("Refresh successfully.");
})();
