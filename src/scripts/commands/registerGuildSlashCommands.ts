import type { ApplicationCommandDataResolvable } from "discord.js";
import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import Logging from "../../structures/logging/Logging.js";
import subfilePathsOf from "../../utils/subfilePathsOf.js";
import type { Command } from "../../typings/structures/commands/SmoothieCommand.js";
import importDefault from "../../utils/importDefault.js";

dotenv.config();

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

void (async () => {
    if (!process.env.GUILD_ID) {
        Logging.error("Please specify your guildId in .env file!");
        return;
    }
    if (!process.env.CLIENT_ID) {
        Logging.error("Please specify your CLIENT_ID in .env file!");
        return;
    }

    const commands: ApplicationCommandDataResolvable[] = [];
    const paths = await subfilePathsOf("commands");
    Logging.info("Start registering commands...");
    for (const path of paths) {
        const command = await importDefault<Command>(path);
        if (!command) break;
        commands.push(command);
    }

    Logging.info(`Start refreshing ${commands.length} slash commands...`);

    await rest.put(
        Routes.applicationGuildCommands(
            process.env.CLIENT_ID,
            process.env.GUILD_ID
        ),
        { body: commands }
    );

    Logging.success("Refresh successfully.");
})();
