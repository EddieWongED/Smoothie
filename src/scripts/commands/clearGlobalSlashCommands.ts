import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const rest = new REST({ version: "10" }).setToken(process.env.botToken);

void (async () => {
    console.log("Attempting to clear global slash commands...");

    await rest.put(Routes.applicationCommands(process.env.clientId), {
        body: [],
    });

    console.log("Clear successfully.");
})();
