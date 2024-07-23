/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import dotenv from "dotenv";
import Database from "../../structures/database/Database.js";
import Logging from "../../structures/logging/Logging.js";
import URLHandler from "../../structures/music/URLHandler.js";
import { StatesModel } from "../../models/guild/States.js";
import type { Song } from "../../models/music/Song.js";

// Import an array of YouTube URL to queue of the current playlist of process.en.GUILD_ID
/** 
1. Create a temp/songs.json at the root of the project.
2. Add GUILD_ID env variable (The guild you want to import the songs to).
3. Add an array of YouTube URL to data/importSongs.json.
4. npm run import-songs
*/
dotenv.config();

void (async () => {
    let urls: string[] | null = null;
    Logging.error("Importing songs from temp/songs.json...");
    try {
        const path = "../../../temp/songs.json";
        urls = (
            await import(path, {
                assert: { type: "json" },
            })
        ).default as unknown as string[];
    } catch (err) {
        Logging.error("temp/songs.json not found!");
    }

    if (!urls) return;

    if (!process.env.GUILD_ID) {
        Logging.error("Please specify your guildId in .env file!");
        return;
    }

    // Connect to database
    const database = new Database();
    await database.connect();

    const playlist = await StatesModel.findCurrentPlaylist(
        process.env.GUILD_ID
    );

    if (!playlist) {
        Logging.error(
            "There is no playlist in this guild! Cannot import the songs."
        );
        return;
    }

    let addedSongs: Song[] = [];

    Logging.info(
        "Parsing the URLs... It might take some time if the array is too large."
    );

    for (const [i, url] of urls.entries()) {
        if (i % 10 === 0) {
            Logging.info(`[${i + 1}/${urls.length}] Parsing URL...`);
        }
        const { songs } = await URLHandler.parseAndSave(
            url,
            process.env.GUILD_ID
        );

        if (!songs) continue;
        addedSongs = addedSongs.concat(songs);
    }

    const numSongAdded = await playlist.addSong(addedSongs, "last");

    Logging.success(`Added ${numSongAdded} new song(s) to the queue.`);
    return;
})();
