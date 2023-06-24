import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.pause, {
    name: Commands.pause,
    aliases: ["stop"],
    description: getLocale(defaultLanguage, "pauseDescription"),
    descriptionLocalizations: getLocalizationMap("pauseDescription"),
    run: async ({ guildId, reply }) => {
        const player = client.audioPlayers.get(guildId);
        const success = player?.pause();
        if (!player || !success) {
            await reply.error({
                title: "errorTitle",
                description: "pauseFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "pauseSuccessMessage",
        });

        return;
    },
});
