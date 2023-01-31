import { Events } from "discord.js";
import { client } from "../index.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";
import type { SlashCommandPayload } from "../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieEvent(
    Events.InteractionCreate,
    async (interaction) => {
        if (interaction.isChatInputCommand()) {
            const slashCommandPayload = interaction as SlashCommandPayload;
            slashCommandPayload.payloadType = "slash";
            await client.commandHandler.handleSlashCommand(slashCommandPayload);
        }
        return;
    }
);
