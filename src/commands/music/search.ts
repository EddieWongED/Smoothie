import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import QueueHandler from "../../structures/music/QueueHandler.js";

const queryOption: ApplicationCommandStringOption = {
    name: "query",
    type: ApplicationCommandOptionType.String,
    description: "The keywords of songs you want to search from your queue.",
    required: true,
};

export const searchOptions: ApplicationCommandOptionData[] = [queryOption];

export default new SmoothieCommand(Commands.search, {
    name: Commands.search,
    description: "Search songs from your queue.",
    options: searchOptions,
    run: async ({ guildId, reply, options }) => {
        const { query } = options;
        const queueHandler = new QueueHandler(guildId);
        const similarityMap = await queueHandler.search(query);
        if (!similarityMap) {
            await reply.error({
                title: "errorTitle",
                description: "searchFailedMessage",
                descriptionArgs: [query],
            });
            return;
        }

        const titles = similarityMap
            .filter((similarity) => similarity !== 0)
            .sort((s1, s2) => s2 - s1)
            .map(
                (similarity, title) =>
                    `${title} (${(similarity * 100).toFixed(2)}%)`
            );

        if (titles.length === 0) {
            await reply.error({
                title: "errorTitle",
                description: "searchFailedMessage",
                descriptionArgs: [query],
            });
            return;
        }

        await reply.list({
            title: "searchTitle",
            titleArgs: [query],
            list: titles,
            indexing: false,
        });
        return;
    },
});
