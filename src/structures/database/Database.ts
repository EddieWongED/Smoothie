import mongoose from "mongoose";
import Logging from "../logging/Logging.js";
import GuildDataController from "./GuildDataController.js";

export default class Database {
    guildData = new GuildDataController();

    async connect() {
        try {
            mongoose.set("strictQuery", true);
            Logging.info("Connecting to database...");
            await mongoose.connect(`${process.env.MONGODB_URL}/smoothie`, {
                w: "majority",
                retryWrites: true,
            });
            Logging.success("Connected to database.");
        } catch (err) {
            Logging.error(err);
        }
    }
}
