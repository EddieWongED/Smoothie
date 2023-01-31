import { Events } from "discord.js";
import { client } from "../index.js";
import GuildDataHandler from "../structures/database/GuildDataHandler.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";
import type { SlashCommandPayload } from "../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieEvent(
    Events.InteractionCreate,
    async (interaction) => {
        if (interaction.isChatInputCommand()) {
            // Create guild data
            const guildId = interaction.guildId;
            if (!guildId) return;
            const guildData = new GuildDataHandler(guildId);

            const slashCommandPayload = interaction as SlashCommandPayload;
            slashCommandPayload.payloadType = "slash";
            await client.commandHandler.handleSlashCommand(
                slashCommandPayload,
                guildData
            );
        }
        return;
    }
);
