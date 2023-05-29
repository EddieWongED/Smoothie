import type { ApplicationCommandDataResolvable } from "discord.js";
import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import Logging from "../../structures/logging/Logging.js";
import subfilePathsOf from "../../utils/subfilePathsOf.js";
import importDefault from "../../utils/importDefault.js";
import type { Command } from "../../typings/structures/commands/SmoothieCommand.js";

dotenv.config();

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

void (async () => {
    const commands: ApplicationCommandDataResolvable[] = [];
    const paths = await subfilePathsOf("commands");
    Logging.info("Start registering commands...");
    for (const path of paths) {
        console.log(path);
        const command = await importDefault<Command>(path);
        if (!command) break;
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

    Logging.success("Refresh successfully.");
})();
