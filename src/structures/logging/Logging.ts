/* eslint-disable @typescript-eslint/naming-convention */
import chalk from "chalk";
import colorize from "json-colorizer";
import type { LoggingLevel } from "../../typings/structures/logging/Logging.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Logging {
    public static log = (...args: unknown[]) => this.info(...args);

    public static info = (...args: unknown[]) => {
        console.log(this._parseMessage("info", ...args));
    };

    public static success = (...args: unknown[]) =>
        console.log(this._parseMessage("success", ...args));

    public static warn = (...args: unknown[]) =>
        console.warn(this._parseMessage("warn", ...args));

    public static error = (...args: unknown[]) => console.error(...args);

    public static debug = (...args: unknown[]) => {
        if (process.env.ENV === "debug") {
            console.log(this._parseMessage("debug", ...args));
        }
    };

    private static _getPrefix = (level: LoggingLevel): string => {
        const prefix = `[${new Date().toUTCString()}] [${level.toUpperCase()}] `;
        return prefix;
    };

    private static _colorize(level: LoggingLevel, message: string) {
        let hex = "";
        switch (level) {
            case "info":
                hex = "#3f84fc";
                break;
            case "success":
                hex = "#34c759";
                break;
            case "warn":
                hex = "#ff9f0a";
                break;
            case "error":
                hex = "#cf000f";
                break;
            case "debug":
                hex = "#ffcc00";
                break;
        }
        return chalk.hex(hex)(message);
    }

    private static _parseMessage(level: LoggingLevel, ...args: unknown[]) {
        const message = this._colorize(level, this._getPrefix(level)).concat(
            args
                .map((arg) =>
                    typeof arg === "string"
                        ? this._colorize(level, arg)
                        : colorize(JSON.stringify(arg, null, 4), {
                              colors: {
                                  STRING_KEY: "#f9c828",
                                  BRACE: "#d55f95",
                                  BRACKET: "#459df1",
                                  COLON: "#ffffff",
                                  COMMA: "#ffffff",
                                  STRING_LITERAL: "#f6676b",
                                  NUMBER_LITERAL: "#f6676b",
                                  BOOLEAN_LITERAL: "#f6676b",
                                  NULL_LITERAL: "#f6676b",
                              },
                          })
                )
                .join(" ")
        );
        return message;
    }
}
