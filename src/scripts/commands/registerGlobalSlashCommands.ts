import type { ApplicationCommandDataResolvable } from "discord.js";
import { REST, Routes } from "discord.js";
import glob from "glob";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import dotenv from "dotenv";
import type { SmoothieCommandTypes } from "../../typings/structures/commands/SmoothieCommand.js";
import Logging from "../../structures/logging/Logging.js";

dotenv.config();

const globPromise = promisify(glob);
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

const importCommand = async (
    filePath: string
): Promise<SmoothieCommandTypes | null> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const importedObject: unknown = (await import(filePath))?.default;
        const command = importedObject as SmoothieCommandTypes;
        return command;
    } catch (err) {
        console.error(err);
        return null;
    }
};

void (async () => {
    const commands: ApplicationCommandDataResolvable[] = [];

    const commandFiles = await globPromise(
        `${dirName}/../../commands/*/*{.ts,.js}`
    );

    for (const filePath of commandFiles) {
        const command = await importCommand(filePath);
        if (!command) return;
        if (command.aliases) {
            for (const alias of command.aliases) {
                const aliasCommand = Object.assign({}, command);
                aliasCommand.name = alias;
                commands.push(aliasCommand);
            }
        }
        commands.push(command);
    }

    Logging.info(`Start refreshing ${commands.length} slash commands...`);

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
    });

    Logging.info("Refresh successfully.");
})();
