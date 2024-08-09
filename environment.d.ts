/* eslint-disable @typescript-eslint/naming-convention */
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            CLIENT_ID: string;
            GUILD_ID: string;
            MONGODB_URL: string;
            YOUTUBE_COOKIE?: string;
            ENV: "dev" | "prod" | "debug";
        }
    }
}

export {};
