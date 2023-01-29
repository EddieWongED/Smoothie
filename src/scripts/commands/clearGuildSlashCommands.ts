import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const rest = new REST({ version: "10" }).setToken(process.env.botToken);

void (async () => {
    if (!process.env.guildId) {
        console.log("Please specify your guildId in .env file!");
        return;
    }
    if (!process.env.clientId) {
        console.log("Please specify your clientId in .env file!");
        return;
    }

    console.log("Attempting to clear guild slash commands...");

    await rest.put(
        Routes.applicationGuildCommands(
            process.env.clientId,
            process.env.guildId
        ),
        { body: [] }
    );

    console.log("Clear successfully.");
})();
