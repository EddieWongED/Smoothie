import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.prev, {
    name: Commands.prev,
    aliases: ["previous"],
    description: "Play the previous song.",
    run: async ({ guildId, reply }) => {
        const player = client.audioPlayers.get(guildId);
        const song = await player?.playPrev();
        if (!player || !song) {
            await reply.error({
                title: "errorTitle",
                description: "prevFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "playSuccessMessage",
            descriptionArgs: [song.title],
        });

        return;
    },
});
