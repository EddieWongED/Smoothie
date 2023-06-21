/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import dotenv from "dotenv";
import Database from "../../structures/database/Database.js";
import GuildStatesHandler from "../../structures/database/GuildStatesHandler.js";
import Logging from "../../structures/logging/Logging.js";
import QueueHandler from "../../structures/music/QueueHandler.js";
import URLHandler from "../../structures/music/URLHandler.js";
import type { Song } from "../../data/music/Song.js";

// Import an array of YouTube URL to queue of process.en.GUILD_ID
/** 
1. Create a data/importSongs.json at the root of the project.
2. Add GUILD_ID env variable (The guild you want to import the songs to).
3. Add an array of YouTube URL to data/importSongs.json.
4. npm run import-songs
*/
dotenv.config();

void (async () => {
    let urls: string[] | null = null;
    try {
        const path = "../../../data/importSongs.json";
        urls = (
            await import(path, {
                assert: { type: "json" },
            })
        ).default as unknown as string[];
    } catch (err) {
        Logging.error("data/importSongs.json not found!");
    }

    if (!urls) return;

    if (!process.env.GUILD_ID) {
        Logging.error("Please specify your guildId in .env file!");
        return;
    }

    // Connect to database
    const database = new Database();
    await database.connect();

    const guildStates = new GuildStatesHandler(process.env.GUILD_ID);

    const playlistName = await guildStates.get("currentPlaylistName");

    if (!playlistName) {
        Logging.error(
            "There is no playlist in this guild! Cannot import the songs."
        );
        return;
    }

    const queueHandler = new QueueHandler(process.env.GUILD_ID);

    let songs: Song[] = [];

    Logging.info(
        "Parsing the URLs... It might take some time if the array is too large."
    );

    for (const url of urls) {
        const song = await URLHandler.parse(url);
        if (!song) continue;
        songs = songs.concat(song);
    }

    Logging.success("Parsed the URLs.");
    Logging.info("Queuing the songs...");

    const addedSongs = await queueHandler.add(songs, "last");
    if (!addedSongs) {
        Logging.error("Failed to put the songs into the queue.");
        return;
    }

    Logging.success(
        `Added ${addedSongs.length} new song(s) to the queue. ${
            songs.length - addedSongs.length
        } song(s) was/were already in the queue so they didn't get added.`
    );
    return;
})();
