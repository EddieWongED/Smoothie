import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import getLocalizationMap from "../../utils/getLocalizationMap.js";
import { StatesModel } from "../../models/guild/States.js";

const queryOption: ApplicationCommandStringOption = {
    name: "query",
    type: ApplicationCommandOptionType.String,
    description: getLocale(defaultLanguage, "searchQueryOptionDescription"),
    descriptionLocalizations: getLocalizationMap(
        "searchQueryOptionDescription"
    ),
    required: true,
};

export const searchOptions: ApplicationCommandOptionData[] = [queryOption];

export default new SmoothieCommand(Commands.search, {
    name: Commands.search,
    description: getLocale(defaultLanguage, "searchDescription"),
    descriptionLocalizations: getLocalizationMap("searchDescription"),
    options: searchOptions,
    run: async ({ guildId, reply, options }) => {
        const { query } = options;

        const playlist = await StatesModel.findCurrentPlaylist(guildId);

        if (!playlist) {
            await reply.error({
                title: "errorTitle",
                description: "searchFailedMessage",
                descriptionArgs: [query],
            });
            return;
        }

        const similarityMap = await playlist.search(query);

        const titles = similarityMap.map(
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
