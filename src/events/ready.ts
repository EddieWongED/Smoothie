import { Events } from "discord.js";
import { SmoothieEvent } from "../structures/events/SmoothieEvent.js";
import Logging from "../structures/logging/Logging.js";

export default new SmoothieEvent(Events.ClientReady, () => {
    Logging.success("Bot is online.");
    return;
});
