import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.unpause, {
    name: Commands.unpause,
    aliases: ["resume"],
    description: "Unpause the current song.",
    run: async ({ guildId, reply }) => {
        const player = client.audioPlayers.get(guildId);
        const success = player?.unpause();
        if (!player || !success) {
            await reply.error({
                title: "errorTitle",
                description: "unpauseFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "unpauseSuccessMessage",
        });

        return;
    },
});
