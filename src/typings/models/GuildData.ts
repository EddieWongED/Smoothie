import type { Language } from "../i18n/i18n.js";

// Need manually in sync with GuildData Schema
export default interface GuildData {
    guildId: string;
    prefix: string;
    language: Language;
}
