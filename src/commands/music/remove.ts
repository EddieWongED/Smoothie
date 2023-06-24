import type {
    ApplicationCommandNumericOptionData,
    ApplicationCommandOptionData,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import QueueHandler from "../../structures/music/QueueHandler.js";
import { client } from "../../index.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";

const indexOption: ApplicationCommandNumericOptionData = {
    name: "index",
    type: ApplicationCommandOptionType.Integer,
    description: getLocale(defaultLanguage, "removeIndexOptionDescription"),
    descriptionLocalizations: getLocalizationMap(
        "removeIndexOptionDescription"
    ),
    required: true,
};

export const removeOptions: ApplicationCommandOptionData[] = [indexOption];

export default new SmoothieCommand(Commands.remove, {
    name: Commands.remove,
    aliases: ["delete"],
    description: getLocale(defaultLanguage, "removeDescription"),
    descriptionLocalizations: getLocalizationMap("removeDescription"),
    options: removeOptions,
    run: async ({ options, guildId, reply }) => {
        const { index } = options;
        const queueHandler = new QueueHandler(guildId);
        const queue = await queueHandler.fetch();

        if (!queue) {
            await reply.error({
                title: "errorTitle",
                description: "removeFailedMessage",
            });
            return;
        }

        // Throw error if the queue is empty
        if (queue.length === 0) {
            await reply.error({
                title: "errorTitle",
                description: "noSonginPlaylistMessage",
            });
            return;
        }

        // Limit the range of index
        if (index < 1 || index > queue.length) {
            await reply.error({
                title: "errorTitle",
                description: "removeIndexOutOfRangeMessage",
                descriptionArgs: [queue.length.toString()],
            });
            return;
        }

        const songToBeRemoved = await queueHandler.index(index);
        if (!songToBeRemoved) {
            await reply.error({
                title: "errorTitle",
                description: "removeFailedMessage",
            });
            return;
        }

        if (
            !(await reply.confirm({
                title: "confirmTitle",
                description: "confirmRemoveSongMessage",
                descriptionArgs: [songToBeRemoved.title],
            }))
        ) {
            await reply.success({
                title: "cancelSuccessTitle",
                description: "cancelRemoveSongSuccessMessage",
                descriptionArgs: [songToBeRemoved.title],
            });
            return;
        }

        const song = await queueHandler.remove(index);
        if (!song) {
            await reply.error({
                title: "errorTitle",
                description: "removeFailedMessage",
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "removeSuccessMessage",
            descriptionArgs: [song.title],
        });

        // Play next song if the first song is removed
        const player = client.audioPlayers.get(guildId);
        if (player && index === 1) {
            await player.playFirst();
        }

        return;
    },
});
