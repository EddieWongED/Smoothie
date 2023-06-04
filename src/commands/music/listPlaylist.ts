import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.listPlaylist, {
    name: Commands.listPlaylist,
    aliases: ["listplaylists", "showplaylist"],
    description: "List all the playlists.",
    run: async ({ reply, guildData }) => {
        const playlists = await guildData.get("playlists");
        if (!playlists) {
            await reply.error({
                title: "errorTitle",
                description: "listPlaylistFailedMessage",
            });
            return;
        }

        // Check if there is any playlist
        if (playlists.length === 0) {
            await reply.error({
                title: "errorTitle",
                description: "noPlaylistMessage",
            });
            return;
        }

        const playlistTitles = playlists.map((playlist) => playlist.name);
        await reply.list({ title: "successTitle", list: playlistTitles });
        return;
    },
});
