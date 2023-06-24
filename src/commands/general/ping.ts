import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.ping, {
    name: Commands.ping,
    description: getLocale(defaultLanguage, "pingDescription"),
    descriptionLocalizations: getLocalizationMap("pingDescription"),
    run: async ({ reply }) => {
        await reply.info({ title: "pingMessage", description: "pingMessage" });
        return;
    },
});
