import chalk from "chalk";
import { client } from "../../index.js";

export default class GuildLogging {
    public guildName: string;
    constructor(public guildId: string) {
        const guild = client.guilds.cache.get(this.guildId);
        this.guildName = guild?.name ?? "";
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public log = (args: any) => this.info(args);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public info = (args: any) =>
        console.log(
            chalk.blue(`[${new Date().toUTCString()}] [INFO] `),
            chalk.green(`[${this.guildName} (${this.guildId})]`),
            typeof args === "string" ? chalk.bold(chalk.blueBright(args)) : args
        );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public warn = (args: any) =>
        console.log(
            chalk.yellow(`[${new Date().toUTCString()}] [WARN] `),
            chalk.green(`[${this.guildName} (${this.guildId})]`),
            typeof args === "string"
                ? chalk.bold(chalk.yellowBright(args))
                : args
        );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public error = (args: any) =>
        console.log(
            chalk.red(`[${new Date().toUTCString()}] [ERROR] `),
            chalk.green(`[${this.guildName} (${this.guildId})]`),
            typeof args === "string" ? chalk.bold(chalk.redBright(args)) : args
        );
}
