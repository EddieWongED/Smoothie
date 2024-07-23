import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../../typings/structures/commands/SmoothieCommand.js";
import { defaultLanguage, getLocale } from "../../../i18n/i18n.js";
import { PlaylistModel } from "../../../models/music/Playlist.js";
import getLocalizationMap from "../../../utils/getLocalizationMap.js";
import { StatesModel } from "../../../models/guild/States.js";
import { MongoError } from "mongodb";

const nameOption: ApplicationCommandStringOption = {
    name: "name",
    type: ApplicationCommandOptionType.String,
    description: getLocale(
        defaultLanguage,
        "createPlaylistNameOptionDescription"
    ),
    descriptionLocalizations: getLocalizationMap(
        "createPlaylistNameOptionDescription"
    ),
    required: true,
};

export const createPlaylistOptions: ApplicationCommandOptionData[] = [
    nameOption,
];

export default new SmoothieCommand(Commands.createPlaylist, {
    name: Commands.createPlaylist,
    aliases: ["addplaylist"],
    description: getLocale(defaultLanguage, "createPlaylistDescription"),
    descriptionLocalizations: getLocalizationMap("createPlaylistDescription"),
    options: createPlaylistOptions,
    run: async ({ options, reply, guildId }) => {
        const { name } = options;
        // Check if name is empty or not
        if (name.length === 0) {
            await reply.error({
                title: "errorTitle",
                description: "playlistNameNotEmptyMessage",
            });
            return;
        }

        try {
            const playlist = await PlaylistModel.create({ guildId, name });
            await StatesModel.findAndSetCurrentPlaylistIfNull(
                guildId,
                playlist
            );
        } catch (err) {
            if (err instanceof MongoError) {
                if (err.code === 11000) {
                    await reply.error({
                        title: "errorTitle",
                        description: "playlistAlreadyExistMessage",
                        descriptionArgs: [name],
                    });
                    return;
                }
            }

            await reply.error({
                title: "errorTitle",
                description: "createPlaylistFailedMessage",
                descriptionArgs: [name],
            });
            return;
        }

        await reply.success({
            title: "successTitle",
            description: "createPlaylistSuccessMessage",
            descriptionArgs: [name],
        });

        return;
    },
});
