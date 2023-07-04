import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Emojis } from "../../typings/emoji/Emoji.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.queueRank, {
    name: Commands.queueRank,
    description: getLocale(defaultLanguage, "queueRankDescription"),
    descriptionLocalizations: getLocalizationMap("queueRankDescription"),
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
            emoji: Emojis.trophy,
        });

        return;
    },
});
