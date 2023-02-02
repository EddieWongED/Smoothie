import chalk from "chalk";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Logging {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static log = (args: any) => this.info(args);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static info = (args: any) =>
        console.log(
            chalk.blue(`[${new Date().toUTCString()}] [INFO] `),
            typeof args === "string" ? chalk.bold(chalk.blueBright(args)) : args
        );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static warn = (args: any) =>
        console.log(
            chalk.yellow(`[${new Date().toUTCString()}] [WARN] `),
            typeof args === "string"
                ? chalk.bold(chalk.yellowBright(args))
                : args
        );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static error = (args: any) =>
        console.log(
            chalk.red(`[${new Date().toUTCString()}] [ERROR] `),
            typeof args === "string" ? chalk.bold(chalk.redBright(args)) : args
        );
}
