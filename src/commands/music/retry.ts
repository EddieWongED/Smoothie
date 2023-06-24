import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.retry, {
    name: Commands.retry,
    aliases: ["replay"],
    description: getLocale(defaultLanguage, "retryDescription"),
    descriptionLocalizations: getLocalizationMap("retryDescription"),
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
