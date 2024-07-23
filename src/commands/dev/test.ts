import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";
import Logging from "../../structures/logging/Logging.js";
import { StatesModel } from "../../models/guild/States.js";

export default new SmoothieCommand(Commands.test, {
    name: Commands.test,
    description: getLocale(defaultLanguage, "testDescription"),
    descriptionLocalizations: getLocalizationMap("testDescription"),
    run: async ({ guildId }) => {
        const playlist = await StatesModel.findCurrentPlaylist(guildId);
        if (playlist == null) {
            return;
        }
        Logging.info(await playlist.nextSong());
        return;
    },
});
