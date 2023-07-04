import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import Logging from "../../structures/logging/Logging.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.test, {
    name: Commands.test,
    description: getLocale(defaultLanguage, "testDescription"),
    descriptionLocalizations: getLocalizationMap("testDescription"),
    run: () => {
        Logging.info(client.emojis.cache.map((emoji) => emoji.identifier));
        return;
    },
});
