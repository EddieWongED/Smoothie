import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.retry, {
    name: Commands.retry,
    aliases: ["replay"],
    description:
        "Try to play the first song again. Useful when there was error playing the song before.",
    run: async ({ guildId, reply }) => {
        const player = client.audioPlayers.get(guildId);
        const song = await player?.playFirst();
        if (!player || !song) {
            await reply.error({
                title: "errorTitle",
                description: "retryFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "retrySuccessMessage",
            descriptionArgs: [song.title],
        });

        return;
    },
});
