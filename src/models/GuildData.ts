import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";
import { Languages } from "../typings/i18n/i18n.js";
import type GuildData from "../typings/models/GuildData.js";

export interface GuildDataModel extends GuildData, Document {}

// Need manually in sync with GuildData interface
const guildDataSchema: Schema = new Schema(
    {
        guildId: { type: String, required: true, unique: true },
        prefix: { type: String, required: true, default: "$" },
        language: {
            type: String,
            required: true,
            default: Languages.en,
            enum: Object.values(Languages),
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<GuildDataModel>("GuildData", guildDataSchema);
