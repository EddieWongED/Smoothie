declare global {
    namespace NodeJS {
        interface ProcessEnv {
            botToken: string;
            clientId: string;
            guildId: string;
            mongodbURL: string;
            environment: "dev" | "prod";
        }
    }
}

export {};
