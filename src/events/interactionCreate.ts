import { Events } from "discord.js";
import GuildStatesHandler from "../structures/database/GuildStatesHandler.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";
import type { SlashCommandPayload } from "../typings/structures/commands/SmoothieCommand.js";
import { CommandHandler } from "../structures/commands/CommandHandler.js";

export default new SmoothieEvent(
    Events.InteractionCreate,
    async (interaction) => {
        if (interaction.isChatInputCommand()) {
            // Create guild data
            const guildId = interaction.guildId;
            if (!guildId) return;
            const guildStates = new GuildStatesHandler(guildId);

            const slashCommandPayload = interaction as SlashCommandPayload;
            slashCommandPayload.payloadType = "slash";

            const channel = slashCommandPayload.channel;
            if (channel) {
                await guildStates.update("textChannelId", channel.id);
            }

            await CommandHandler.handleSlashCommand(slashCommandPayload);
        }
        return;
    }
);
