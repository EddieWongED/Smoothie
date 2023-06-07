import type {
    ApplicationCommandOptionData,
    ApplicationCommandStringOption,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { SmoothieCommand } from "../../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../../typings/structures/commands/SmoothieCommand.js";
import { defaultLanguage, getLocale } from "../../../i18n/i18n.js";
import BasicEmbed from "../../../structures/embed/BasicEmbed.js";
import formatTime from "../../../utils/formatTime.js";

const nameOption: ApplicationCommandStringOption = {
    name: "name",
    type: ApplicationCommandOptionType.String,
    description:
        "The name of the playlist which you want the info of. If no name is given, the current playlist's info will be shown.",
    required: false,
};

export const infoPlaylistOptions: ApplicationCommandOptionData[] = [nameOption];

export default new SmoothieCommand(Commands.infoPlaylist, {
    name: Commands.infoPlaylist,
    description:
        "Show the info of a playlist. If no name is given, the current playlist's info will be shown.",
    options: infoPlaylistOptions,
    run: async ({ options, reply, guildData, guildStates }) => {
        let { name } = options;

        // Show current playlist info if no name is given
        if (!name) {
            const currentPlaylistName = await guildStates.get(
                "currentPlaylistName"
            );
            if (!currentPlaylistName) {
                await reply.error({
                    title: "errorTitle",
                    description: "currentInfoPlaylistFailedMessage",
                });
                return;
            }
            name = currentPlaylistName;
        }

        // Check if name is empty or not
        if (name.length === 0) {
            await reply.error({
                title: "errorTitle",
                description: "playlistNameNotEmptyMessage",
            });
            return;
        }

        const playlists = await guildData.get("playlists");
        if (!playlists) {
            await reply.error({
                title: "errorTitle",
                description: "infoPlaylistFailedMessage",
                descriptionArgs: [name],
            });
            return;
        }

        // Check if the playlist exists
        const playlist = playlists.find((playlist) => playlist.name === name);
        if (!playlist) {
            await reply.error({
                title: "errorTitle",
                description: "playlistDoesNotExistMessage",
                descriptionArgs: [name],
            });
            return;
        }

        // Show info
        const language = (await guildData.get("language")) ?? defaultLanguage;

        const title = name;
        const topFivePlayedSongs = playlist.queue
            .sort((song1, song2) => {
                return song2.playCount - song1.playCount;
            })
            .slice(0, 5)
            .map((song, i) => `${i + 1}. ${song.title} [${song.playCount}]`);

        const topFivePlayedSongsString = topFivePlayedSongs.length
            ? `\`\`\`md\n${topFivePlayedSongs.join("\n")}\n\`\`\``
            : getLocale(language, "noSonginPlaylistMessage");

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
                    value: formatTime(
                        playlist.queue
                            .map((song) => song.duration)
                            .reduce((a, b) => a + b, 0)
                    ),
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
