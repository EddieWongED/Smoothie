import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.unpause, {
    name: Commands.unpause,
    aliases: ["resume"],
    description: getLocale(defaultLanguage, "unpauseDescription"),
    descriptionLocalizations: getLocalizationMap("unpauseDescription"),
    run: async ({ guildId, reply }) => {
        const player = client.audioPlayers.get(guildId);
        const success = player?.unpause();
        if (!player || !success) {
            await reply.error({
                title: "errorTitle",
                description: "unpauseFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "unpauseSuccessMessage",
        });

        return;
    },
});
