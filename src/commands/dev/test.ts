import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.test, {
    name: Commands.test,
    description: getLocale(defaultLanguage, "testDescription"),
    descriptionLocalizations: getLocalizationMap("testDescription"),
    run: () => {
        return;
    },
});
