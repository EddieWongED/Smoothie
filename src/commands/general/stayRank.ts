import { UserStatsModel } from "../../models/user/UserStats.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Emojis } from "../../typings/emoji/Emoji.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import { formatTimeWithLetter } from "../../utils/formatTime.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.stayRank, {
    name: Commands.stayRank,
    description: getLocale(defaultLanguage, "stayRankDescription"),
    descriptionLocalizations: getLocalizationMap("stayRankDescription"),
    run: async ({ guildId, reply }) => {
        const allUserStats = await UserStatsModel.findAllByGuildId(guildId);
        if (allUserStats.length === 0) {
            await reply.error({
                title: "errorTitle",
                description: "stayRankFailedMessage",
            });
            return;
        }

        const ranking = await Promise.all(
            allUserStats.map(async (userStat) => {
                const user = await client.users.fetch(userStat.userId);
                return `${user.username}: ${formatTimeWithLetter(
                    userStat.stayDuration
                )}
                    `;
            })
        );

        await reply.list({
            list: ranking,
            title: "stayRankTitle",
            emoji: Emojis.trophy,
        });

        return;
    },
});
