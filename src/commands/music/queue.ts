import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import QueueHandler from "../../structures/music/QueueHandler.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.queue, {
    name: Commands.queue,
    description: "Show the queue of the current playlist.",
    run: async ({ guildId, guildStates, reply }) => {
        const queueHandler = new QueueHandler(guildId);
        const queue = await queueHandler.fetch();

        const name = await guildStates.get("currentPlaylistName");

        if (!name || !queue) {
            await reply.error({
                title: "errorTitle",
                description: "queueFailedMessage",
            });
            return;
        }

        await reply.list({
            list: queue.map((song) => song.title),
            title: "queueTitle",
            titleArgs: [name],
        });

        return;
    },
});
