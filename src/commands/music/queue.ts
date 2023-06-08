import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.queue, {
    name: Commands.queue,
    description: "Show the queue of the current playlist.",
    run: async ({ guildData, guildStates, reply }) => {
        const playlists = await guildData.get("playlists");
        const name = await guildStates.get("currentPlaylistName");
        const playlist = playlists?.find((playlist) => playlist.name === name);
        if (!name || !playlists || !playlist) {
            await reply.error({
                title: "errorTitle",
                description: "queueFailedMessage",
            });
            return;
        }

        await reply.list({
            list: playlist.queue.map((song) => song.title),
            title: "queueTitle",
            titleArgs: [name],
        });

        return;
    },
});
