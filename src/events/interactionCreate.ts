import type { CommandInteractionOptionResolver } from "discord.js";
import { Events } from "discord.js";
import { client } from "../index.js";
import { SmoothieEvent } from "../structures/SmoothieEvent.js";

export default new SmoothieEvent(Events.InteractionCreate,
    async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        // Slash command handler
        try {
            await interaction.deferReply();
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction,
            });
        } catch (err) {
            console.error(err);
        }
    });
