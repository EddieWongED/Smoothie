import { getModelForClass } from "@typegoose/typegoose";
import { GuildData } from "../data/guild/GuildData.js";

export default getModelForClass(GuildData, {
    schemaOptions: { timestamps: true },
});
