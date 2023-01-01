import { SmoothieEvent } from "../structures/SmoothieEvent.js";

export default new SmoothieEvent("ready", () => {
    console.log("Bot is online.");
});
