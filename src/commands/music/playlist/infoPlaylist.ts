import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../../typings/structures/commands/SmoothieCommand.js";
import { defaultLanguage, getLocale } from "../../../i18n/i18n.js";
import BasicEmbed from "../../../structures/embed/BasicEmbed.js";
import { formatTimeWithLetter } from "../../../utils/formatTime.js";
import getLocalizationMap from "../../../utils/getLocalizationMap.js";
import type { DocumentType } from "@typegoose/typegoose";
import {
    PlaylistModel,
    type Playlist,
} from "../../../models/music/Playlist.js";
import { StatesModel } from "../../../models/guild/States.js";
import { ConfigsModel } from "../../../models/guild/Configs.js";

const nameOption: ApplicationCommandStringOption = {
    name: "name",
    type: ApplicationCommandOptionType.String,
    description: getLocale(
        defaultLanguage,
        "infoPlaylistNameOptionDescription"
    ),
    descriptionLocalizations: getLocalizationMap(
        "infoPlaylistNameOptionDescription"
    ),
    required: false,
};

export const infoPlaylistOptions: ApplicationCommandOptionData[] = [nameOption];

export default new SmoothieCommand(Commands.infoPlaylist, {
    name: Commands.infoPlaylist,
    description: getLocale(defaultLanguage, "infoPlaylistDescription"),
    descriptionLocalizations: getLocalizationMap("infoPlaylistDescription"),
    options: infoPlaylistOptions,
    run: async ({ options, reply, guildId }) => {
        const { name } = options;

        let playlist: DocumentType<Playlist> | null = null;

        // Show current playlist info if no name is given
        if (!name) {
            playlist = await StatesModel.findCurrentPlaylist(guildId);
        }

        // Check if name is empty or not
        if (name && name.length !== 0) {
            playlist = await PlaylistModel.findByGuildIdAndName(guildId, name);
        } else if (name && name.length === 0) {
            await reply.error({
                title: "errorTitle",
                description: "playlistNameNotEmptyMessage",
            });
            return;
        }

        // Check if the playlist exists
        if (!playlist) {
            await reply.error({
                title: "errorTitle",
                description: "playlistDoesNotExistMessage",
                descriptionArgs: [name ?? ""],
            });
            return;
        }

        // Show info
        const language =
            (await ConfigsModel.findByGuildId(guildId))?.language ??
            defaultLanguage;

        const title = playlist.name;
        const topFivePlayedSongs = await playlist.getTopPlayedSongs(5);

        const topFivePlayedSongsString = topFivePlayedSongs.length
            ? `\`\`\`md\n${topFivePlayedSongs
                  .map(
                      (song, i) => `${i + 1}. ${song.title} [${song.playCount}]`
                  )
                  .join("\n")}\n\`\`\``
            : getLocale(language, "noSonginPlaylistMessage");

        const totalDuration = await playlist.getTotalDuration();

        const embed = BasicEmbed.create({
            title: title,
            fields: [
                {
                    name: getLocale(language, "createdAtField"),
                    value: `<t:${Math.floor(
                        playlist.createdAt.getTime() / 1000
                    )}>`,
                    inline: true,
                },
                {
                    name: getLocale(language, "numberOfSongsField"),
                    value: playlist.queue.length.toString(),
                    inline: true,
                },
                {
                    name: getLocale(language, "totalDurationField"),
                    value: formatTimeWithLetter(totalDuration),
                    inline: true,
                },
                {
                    name: getLocale(language, "topFiveSongsField"),
                    value: topFivePlayedSongsString,
                },
            ],
        });

        await reply.reply(embed);
        return;
    },
});
