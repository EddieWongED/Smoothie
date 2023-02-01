import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { SmoothieCommands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(SmoothieCommands.ping, {
    name: SmoothieCommands.ping,
    description: "Reply with pong!",
    run: async ({ reply }) => {
        await reply.info("pingMessage", "pingMessage");
        return;
    },
});
