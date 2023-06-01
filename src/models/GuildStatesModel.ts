import { getModelForClass } from "@typegoose/typegoose";
import { GuildStates } from "../data/guild/GuildStates.js";

export default getModelForClass(GuildStates, {
    schemaOptions: { timestamps: true },
});
