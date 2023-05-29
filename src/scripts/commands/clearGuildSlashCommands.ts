import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import Logging from "../../structures/logging/Logging.js";

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

    Logging.info("Attempting to clear guild slash commands...");

    await rest.put(
        Routes.applicationGuildCommands(
            process.env.CLIENT_ID,
            process.env.GUILD_ID
        ),
        { body: [] }
    );

    Logging.success("Clear successfully.");
})();
