declare global {
	namespace NodeJS {
		interface ProcessEnv {
			botToken: string;
			clientId: string;
			guildId: string;
			environment: "dev" | "prod";
		}
	}
}

export {};
