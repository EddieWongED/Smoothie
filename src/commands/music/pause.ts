import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.pause, {
    name: Commands.pause,
    aliases: ["stop"],
    description: "Pause the current song.",
    run: async ({ guildId, reply }) => {
        const player = client.audioPlayers.get(guildId);
        const success = player?.pause();
        if (!player || !success) {
            await reply.error({
                title: "errorTitle",
                description: "pauseFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "pauseSuccessMessage",
        });

        return;
    },
});
