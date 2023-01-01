import type { CommandInteractionOptionResolver } from "discord.js";
import { client } from "../index.js";
import { SmoothieEvent } from "../structures/SmoothieEvent.js";

export default new SmoothieEvent("interactionCreate", async (interaction) => {
    // Slash command handler
    if (interaction.isCommand()) {
        await interaction.deferReply();
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            return;
        }

        command.run({
            args: interaction.options as CommandInteractionOptionResolver,
            client,
            interaction,
        });
    }
});
