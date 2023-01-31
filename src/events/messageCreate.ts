import { Events } from "discord.js";
import { client } from "../index.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";
import type { MessageCommandPayload } from "../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieEvent(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith("$")) {
        const messageCommandPayload = message as MessageCommandPayload;
        messageCommandPayload.payloadType = "message";
        await client.commandHandler.handleMessageCommand(messageCommandPayload);
    }
    return;
});
