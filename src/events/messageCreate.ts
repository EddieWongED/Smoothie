import { Events } from "discord.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";
import type { MessageCommandPayload } from "../typings/structures/commands/SmoothieCommand.js";
import { CommandHandler } from "../structures/commands/CommandHandler.js";
import { ConfigsModel } from "../models/guild/Configs.js";
import { StatesModel } from "../models/guild/States.js";

export default new SmoothieEvent(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // Create guild data
    const guildId = message.guildId;
    if (!guildId) return;
    const configs = await ConfigsModel.findByGuildId(guildId);
    const prefix = configs?.prefix;
    if (!prefix) return;

    if (message.content.startsWith(prefix)) {
        const messageCommandPayload = message as MessageCommandPayload;
        messageCommandPayload.payloadType = "message";

        const channelId = messageCommandPayload.channelId;
        if (channelId) {
            await StatesModel.findAndSetTextChannelId(guildId, channelId);
        }

        await CommandHandler.handleMessageCommand(messageCommandPayload);
    }
    return;
});
