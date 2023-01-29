import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import Logging from "../../structures/logging/Logging.js";

dotenv.config();

const rest = new REST({ version: "10" }).setToken(process.env.botToken);

void (async () => {
    if (!process.env.guildId) {
        Logging.error("Please specify your guildId in .env file!");
        return;
    }
    if (!process.env.clientId) {
        Logging.error("Please specify your clientId in .env file!");
        return;
    }

    Logging.info("Attempting to clear guild slash commands...");

    await rest.put(
        Routes.applicationGuildCommands(
            process.env.clientId,
            process.env.guildId
        ),
        { body: [] }
    );

    Logging.info("Clear successfully.");
})();
