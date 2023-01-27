import { Events } from "discord.js";
import { client } from "../index.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";

export default new SmoothieEvent(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith("$")) {
        await client.commandHandler.handleMessageCommand(message);
    }
    return;
});
