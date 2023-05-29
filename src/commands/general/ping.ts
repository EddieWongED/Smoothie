import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.ping, {
    name: Commands.ping,
    description: "Reply with pong!",
    run: async ({ reply }) => {
        await reply.info({ title: "pingMessage", description: "pingMessage" });
        return;
    },
});
