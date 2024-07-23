import { StatesModel } from "../../models/guild/States.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

export default new SmoothieCommand(Commands.queue, {
    name: Commands.queue,
    description: getLocale(defaultLanguage, "queueDescription"),
    descriptionLocalizations: getLocalizationMap("queueDescription"),
    run: async ({ guildId, reply }) => {
        const playlist = await StatesModel.findCurrentPlaylist(guildId);

        if (!playlist) {
            await reply.error({
                title: "errorTitle",
                description: "queueFailedMessage",
            });
            return;
        }

        const queue = await playlist.getQueue({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: 1,
            title: 1,
        });

        await reply.list({
            list: queue.map((song) => song.title.toString()),
            title: "queueTitle",
            titleArgs: [playlist.name],
        });

        return;
    },
});
