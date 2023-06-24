import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import QueueHandler from "../../structures/music/QueueHandler.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.shuffle, {
    name: Commands.shuffle,
    description: getLocale(defaultLanguage, "shuffleDescription"),
    descriptionLocalizations: getLocalizationMap("shuffleDescription"),
    run: async ({ guildId, reply }) => {
        const queueHandler = new QueueHandler(guildId);
        const success = await queueHandler.shuffle();

        if (!success) {
            await reply.error({
                title: "errorTitle",
                description: "shuffleFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "shuffleSuccessMessage",
        });

        return;
    },
});
