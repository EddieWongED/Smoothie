import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.leave, {
    name: Commands.leave,
    description: getLocale(defaultLanguage, "leaveDescription"),
    descriptionLocalizations: getLocalizationMap("leaveDescription"),
    run: async ({ guildId, reply }) => {
        const voiceConnection = client.voiceConnections.get(guildId);
        if (!voiceConnection) {
            await reply.success({
                title: "successTitle",
                description: "leaveSuccessMessage",
            });
            return;
        }

        if (!(await voiceConnection.disconnect())) {
            await reply.error({
                title: "errorTitle",
                description: "leaveFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "leaveSuccessMessage",
        });
        return;
    },
});
