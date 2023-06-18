import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.queueRank, {
    name: Commands.queueRank,
    description:
        "Show the ranking of the number of times played of each song in the current queue.",
    run: async ({ guildData, guildStates, reply }) => {
        const playlists = await guildData.get("playlists");
        const name = await guildStates.get("currentPlaylistName");
        const playlist = playlists?.find((playlist) => playlist.name === name);
        if (!playlists || !name || !playlist) {
            await reply.error({
                title: "errorTitle",
                description: "queueRankFailedMessage",
            });
            return;
        }

        const ranking = playlist.queue
            .sort((song1, song2) => {
                return song2.playCount - song1.playCount;
            })
            .map((song) => `${song.title} [${song.playCount}]`);

        await reply.list({
            list: ranking,
            title: "queueRankTitle",
            titleArgs: [name],
        });

        return;
    },
});
