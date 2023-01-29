import mongoose from "mongoose";
import Logging from "../logging/Logging.js";
import GuildDataController from "./GuildDataController.js";

export default class Database {
    guildData = new GuildDataController();

    constructor() {
        void this._connect();
    }

    private async _connect() {
        try {
            mongoose.set("strictQuery", true);
            Logging.info("Connecting to database...");
            await mongoose.connect(`${process.env.mongodbURL}/smoothie`, {
                w: "majority",
                retryWrites: true,
            });
            Logging.info("Connected to database.");
        } catch (err) {
            Logging.error(err);
        }
    }
}
