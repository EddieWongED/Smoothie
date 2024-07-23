import { StatesModel } from "../../models/guild/States.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Emojis } from "../../typings/emoji/Emoji.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.queueRank, {
    name: Commands.queueRank,
    description: getLocale(defaultLanguage, "queueRankDescription"),
    descriptionLocalizations: getLocalizationMap("queueRankDescription"),
    run: async ({ guildId, reply }) => {
        const playlist = await StatesModel.findCurrentPlaylist(guildId);

        if (!playlist) {
            await reply.error({
                title: "errorTitle",
                description: "queueRankFailedMessage",
            });
            return;
        }

        const topPlayedSongs = await playlist.getTopPlayedSongs();

        const ranking = topPlayedSongs.map(
            (song) => `${song.title} [${song.playCount}]`
        );

        await reply.list({
            list: ranking,
            title: "queueRankTitle",
            titleArgs: [playlist.name],
            emoji: Emojis.trophy,
        });

        return;
    },
});
