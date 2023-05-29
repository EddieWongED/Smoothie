import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import Logging from "../../structures/logging/Logging.js";

dotenv.config();

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

void (async () => {
    Logging.info("Attempting to clear global slash commands...");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: [],
    });

    Logging.success("Clear successfully.");
})();
