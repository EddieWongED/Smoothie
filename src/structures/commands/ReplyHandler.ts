import { getLocale } from "../../i18n/i18n.js";
import type {
    Internationalization,
    LanguageList,
} from "../../typings/i18n/i18n.js";
import type { ReplyLevel } from "../../typings/structures/commands/ReplyHandler.js";
import type {
    CommandPayloadType,
    CommandReplyResponse,
    MessageCommandPayload,
    MessageCommandResponse,
    SlashCommandResponse,
} from "../../typings/structures/commands/SmoothieCommand.js";
import Logging from "../logging/Logging.js";

export default class ReplyHandler {
    private _currentPayload?: CommandPayloadType;
    private _isEditable = false;

    constructor(
        public payload: CommandPayloadType,
        public language: keyof LanguageList
    ) {
        switch (payload.payloadType) {
            case "slash": {
                this._currentPayload = payload;
                break;
            }
        }
    }

    async reply(
        level: ReplyLevel,
        message: keyof Internationalization,
        ...args: string[]
    ): Promise<CommandReplyResponse | null> {
        if (this._isEditable) {
            return this._edit(level, message, ...args);
        }
        let payload: CommandReplyResponse;
        switch (this.payload.payloadType) {
            case "slash": {
                payload = (await this.payload.reply(
                    this._getFormattedString(level, message, ...args)
                )) as SlashCommandResponse;
                payload.payloadType = "slash";
                break;
            }
            case "message": {
                payload = (await this.payload.reply(
                    this._getFormattedString(level, message, ...args)
                )) as MessageCommandResponse;
                payload.payloadType = "message";
                this._currentPayload = payload;
                break;
            }
        }

        this._isEditable = true;
        return payload;
    }

    async info(
        message: keyof Internationalization,
        ...args: string[]
    ): Promise<CommandReplyResponse | null> {
        return this.reply("info", message, ...args);
    }

    async warn(
        message: keyof Internationalization,
        ...args: string[]
    ): Promise<CommandReplyResponse | null> {
        return this.reply("warn", message, ...args);
    }

    async error(
        message: keyof Internationalization,
        ...args: string[]
    ): Promise<CommandReplyResponse | null> {
        return this.reply("error", message, ...args);
    }

    async followUp(
        level: ReplyLevel,
        message: keyof Internationalization,
        ...args: string[]
    ): Promise<MessageCommandPayload | null> {
        if (!this._currentPayload) {
            Logging.warn(
                "Nothing will happen if you call followUp function before replying."
            );
            return null;
        }

        let messagePayload: MessageCommandPayload;
        switch (this._currentPayload.payloadType) {
            case "slash": {
                messagePayload = (await this._currentPayload.followUp(
                    this._getFormattedString(level, message, ...args)
                )) as MessageCommandPayload;
                break;
            }
            case "message": {
                messagePayload = (await this._currentPayload.reply(
                    this._getFormattedString(level, message, ...args)
                )) as MessageCommandPayload;
                break;
            }
        }
        messagePayload.payloadType = "message";
        this._currentPayload = messagePayload;
        return messagePayload;
    }

    async infoFollowUp(
        message: keyof Internationalization,
        ...args: string[]
    ): Promise<CommandReplyResponse | null> {
        return this.followUp("info", message, ...args);
    }

    async warnFollowUp(
        message: keyof Internationalization,
        ...args: string[]
    ): Promise<CommandReplyResponse | null> {
        return this.followUp("warn", message, ...args);
    }

    async errorFollowUp(
        message: keyof Internationalization,
        ...args: string[]
    ): Promise<CommandReplyResponse | null> {
        return this.followUp("error", message, ...args);
    }

    private async _edit(
        level: ReplyLevel,
        message: keyof Internationalization,
        ...args: string[]
    ): Promise<MessageCommandPayload | null> {
        if (!this._isEditable) {
            Logging.warn(
                "Nothing will happen if you call edit function before replying."
            );
            return null;
        }
        if (!this._currentPayload) return null;

        let messagePayload: MessageCommandPayload;
        switch (this._currentPayload.payloadType) {
            case "slash": {
                messagePayload = (await this._currentPayload.editReply(
                    this._getFormattedString(level, message, ...args)
                )) as MessageCommandPayload;
                break;
            }
            case "message": {
                messagePayload = (await this._currentPayload.edit(
                    this._getFormattedString(level, message, ...args)
                )) as MessageCommandPayload;
                break;
            }
        }
        messagePayload.payloadType = "message";
        this._currentPayload = messagePayload;
        return messagePayload;
    }

    private _getFormattedString(
        level: ReplyLevel,
        message: keyof Internationalization,
        ...args: string[]
    ): string {
        switch (level) {
            case "info": {
                return "[INFO] " + getLocale(this.language, message, ...args);
            }
            case "warn": {
                return "[WARN] " + getLocale(this.language, message, ...args);
            }
            case "error": {
                return "[ERROR] " + getLocale(this.language, message, ...args);
            }
        }
    }
}
