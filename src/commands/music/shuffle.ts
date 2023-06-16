import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import QueueHandler from "../../structures/music/QueueHandler.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.shuffle, {
    name: Commands.shuffle,
    description: "Shuffle the current queue.",
    run: async ({ guildId, reply }) => {
        const queueHandler = new QueueHandler(guildId);
        const success = await queueHandler.shuffle();

        if (!success) {
            await reply.error({
                title: "errorTitle",
                description: "shuffleFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "shuffleSuccessMessage",
        });

        return;
    },
});
