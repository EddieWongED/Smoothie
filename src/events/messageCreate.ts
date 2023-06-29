import { Events } from "discord.js";
import GuildDataHandler from "../structures/database/GuildDataHandler.js";
import GuildStatesHandler from "../structures/database/GuildStatesHandler.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";
import type { MessageCommandPayload } from "../typings/structures/commands/SmoothieCommand.js";
import { CommandHandler } from "../structures/commands/CommandHandler.js";

export default new SmoothieEvent(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // Create guild data
    const guildId = message.guildId;
    if (!guildId) return;
    const guildData = new GuildDataHandler(guildId);
    const guildStates = new GuildStatesHandler(guildId);
    const prefix = await guildData.get("prefix");
    if (!prefix) return;

    if (message.content.startsWith(prefix)) {
        const messageCommandPayload = message as MessageCommandPayload;
        messageCommandPayload.payloadType = "message";

        const channelId = messageCommandPayload.channelId;
        if (channelId) {
            await guildStates.update("textChannelId", channelId);
        }

        await CommandHandler.handleMessageCommand(messageCommandPayload);
    }
    return;
});
