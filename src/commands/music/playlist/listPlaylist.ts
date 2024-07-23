import { PlaylistModel } from "../../../models/music/Playlist.js";
import { defaultLanguage, getLocale } from "../../../i18n/i18n.js";
import { SmoothieCommand } from "../../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.listPlaylist, {
    name: Commands.listPlaylist,
    aliases: ["listplaylists", "showplaylist"],
    description: getLocale(defaultLanguage, "listPlaylistDescription"),
    descriptionLocalizations: getLocalizationMap("listPlaylistDescription"),
    run: async ({ reply, guildId }) => {
        const playlists = await PlaylistModel.findAllByGuildId(guildId, {
            name: 1,
        });

        // Check if there is any playlist
        if (playlists.length === 0) {
            await reply.error({
                title: "errorTitle",
                description: "noPlaylistMessage",
            });
            return;
        }

        const playlistTitles = playlists.map((playlist) => playlist.name);
        await reply.list({ title: "listPlaylistTitle", list: playlistTitles });
        return;
    },
});
