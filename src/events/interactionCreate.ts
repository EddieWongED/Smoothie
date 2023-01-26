import { Events } from "discord.js";
import { client } from "../index.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";

export default new SmoothieEvent(
    Events.InteractionCreate,
    async (interaction) => {
        if (interaction.isChatInputCommand()) {
            await client.commandHandler.handleSlashCommand(interaction);
        }
    }
);
