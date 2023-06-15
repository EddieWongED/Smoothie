import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.skip, {
    name: Commands.skip,
    description: "Skip the current song.",
    run: async ({ guildId, reply }) => {
        const player = client.audioPlayers.get(guildId);
        const song = await player?.skip();
        if (!player || !song) {
            await reply.error({
                title: "errorTitle",
                description: "skipFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "skipSuccessMessage",
            descriptionArgs: [song.title],
        });

        return;
    },
});
