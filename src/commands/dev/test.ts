import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import Logging from "../../structures/logging/Logging.js";

export default new SmoothieCommand(Commands.test, {
    name: Commands.test,
    description: "For developer testing only!",
    run: async ({ reply }) => {
        const confirmation = await reply.confirm({
            title: "errorTitle",
            description: "errorTitle",
        });
        await reply.info({
            title: "errorTitle",
            description: "optionsMessage",
            descriptionArgs: [confirmation.toString()],
        });
        Logging.info(confirmation);
    },
});
