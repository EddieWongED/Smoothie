import { Events } from "discord.js";
import { SmoothieEvent } from "../structures/SmoothieEvent.js";

export default new SmoothieEvent(Events.ClientReady, () => {
    console.log("Bot is online.");
});
