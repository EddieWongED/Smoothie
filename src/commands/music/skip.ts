import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.skip, {
    name: Commands.skip,
    description: getLocale(defaultLanguage, "skipDescription"),
    descriptionLocalizations: getLocalizationMap("skipDescription"),
    run: async ({ guildId, reply }) => {
        const player = client.audioPlayers.get(guildId);
        const song = await player?.skip();
        if (!player || !song) {
            await reply.error({
                title: "errorTitle",
                description: "skipFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "skipSuccessMessage",
            descriptionArgs: [song.title],
        });

        return;
    },
});
