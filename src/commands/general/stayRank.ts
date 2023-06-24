import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import { formatTimeWithLetter } from "../../utils/formatTime.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.stayRank, {
    name: Commands.stayRank,
    description: getLocale(defaultLanguage, "stayRankDescription"),
    descriptionLocalizations: getLocalizationMap("stayRankDescription"),
    run: async ({ guildData, reply }) => {
        const userStats = await guildData.get("userStats");
        if (!userStats) {
            await reply.error({
                title: "errorTitle",
                description: "stayRankFailedMessage",
            });
            return;
        }

        const ranking = await Promise.all(
            userStats
                .sort((a, b) => b.stayDuration - a.stayDuration)
                .map(async (userStat) => {
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
        });

        return;
    },
});
