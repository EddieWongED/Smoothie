import { getLocale } from "../../i18n/i18n.js";
import type { Language } from "../../typings/i18n/i18n.js";
import type {
    LevelReplyArgs,
    ReplyArgs,
} from "../../typings/structures/commands/ReplyHandler.js";
import type {
    CommandPayload,
    CommandResponse,
    MessageCommandPayload,
    MessageCommandResponse,
    SlashCommandResponse,
} from "../../typings/structures/commands/SmoothieCommand.js";
import SmoothieEmbed from "../embed/SmoothieEmbed.js";
import Logging from "../logging/Logging.js";

export default class ReplyHandler {
    private _currentPayload?: CommandPayload;
    private _isEditable = false;

    constructor(public payload: CommandPayload, public language: Language) {
        switch (payload.payloadType) {
            case "slash": {
                this._currentPayload = payload;
                break;
            }
        }
    }

    async reply({
        level,
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: LevelReplyArgs): Promise<CommandResponse | null> {
        if (this._isEditable) {
            return this._edit({
                level: level,
                title: title,
                description: description,
                titleArgs: titleArgs,
                descriptionArgs: descriptionArgs,
            });
        }
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const response = SmoothieEmbed.create({
            level: level,
            title: titleString,
            description: descriptionString,
        });
        let payload: CommandResponse;
        switch (this.payload.payloadType) {
            case "slash": {
                payload = (await this.payload.reply(
                    response
                )) as SlashCommandResponse;
                payload.payloadType = "slash";
                break;
            }
            case "message": {
                payload = (await this.payload.reply(
                    response
                )) as MessageCommandResponse;
                payload.payloadType = "message";
                this._currentPayload = payload;
                break;
            }
        }

        this._isEditable = true;
        return payload;
    }

    async success({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs): Promise<CommandResponse | null> {
        return this.reply({
            level: "success",
            title: title,
            description: description,
            titleArgs: titleArgs,
            descriptionArgs: descriptionArgs,
        });
    }

    async info({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs): Promise<CommandResponse | null> {
        return this.reply({
            level: "info",
            title: title,
            description: description,
            titleArgs: titleArgs,
            descriptionArgs: descriptionArgs,
        });
    }

    async warn({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs): Promise<CommandResponse | null> {
        return this.reply({
            level: "warn",
            title: title,
            description: description,
            titleArgs: titleArgs,
            descriptionArgs: descriptionArgs,
        });
    }

    async error({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs): Promise<CommandResponse | null> {
        return this.reply({
            level: "error",
            title: title,
            description: description,
            titleArgs: titleArgs,
            descriptionArgs: descriptionArgs,
        });
    }

    async followUp({
        level,
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: LevelReplyArgs): Promise<MessageCommandPayload | null> {
        if (!this._currentPayload) {
            Logging.warn(
                "Nothing will happen if you call followUp function before replying."
            );
            return null;
        }

        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const response = SmoothieEmbed.create({
            level: level,
            title: titleString,
            description: descriptionString,
        });
        let messagePayload: MessageCommandPayload;
        switch (this._currentPayload.payloadType) {
            case "slash": {
                messagePayload = (await this._currentPayload.followUp(
                    response
                )) as MessageCommandPayload;
                break;
            }
            case "message": {
                messagePayload = (await this._currentPayload.reply(
                    response
                )) as MessageCommandPayload;
                break;
            }
        }
        messagePayload.payloadType = "message";
        this._currentPayload = messagePayload;
        return messagePayload;
    }

    async successFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs): Promise<CommandResponse | null> {
        return this.followUp({
            level: "success",
            title: title,
            description: description,
            titleArgs: titleArgs,
            descriptionArgs: descriptionArgs,
        });
    }

    async infoFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs): Promise<CommandResponse | null> {
        return this.followUp({
            level: "info",
            title: title,
            description: description,
            titleArgs: titleArgs,
            descriptionArgs: descriptionArgs,
        });
    }

    async warnFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs): Promise<CommandResponse | null> {
        return this.followUp({
            level: "warn",
            title: title,
            description: description,
            titleArgs: titleArgs,
            descriptionArgs: descriptionArgs,
        });
    }

    async errorFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs): Promise<CommandResponse | null> {
        return this.followUp({
            level: "error",
            title: title,
            description: description,
            titleArgs: titleArgs,
            descriptionArgs: descriptionArgs,
        });
    }

    private async _edit({
        level,
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: LevelReplyArgs): Promise<MessageCommandPayload | null> {
        if (!this._isEditable) {
            Logging.warn(
                "Nothing will happen if you call edit function before replying."
            );
            return null;
        }
        if (!this._currentPayload) return null;

        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const response = SmoothieEmbed.create({
            level: level,
            title: titleString,
            description: descriptionString,
        });
        let messagePayload: MessageCommandPayload;
        switch (this._currentPayload.payloadType) {
            case "slash": {
                messagePayload = (await this._currentPayload.editReply(
                    response
                )) as MessageCommandPayload;
                break;
            }
            case "message": {
                messagePayload = (await this._currentPayload.edit(
                    response
                )) as MessageCommandPayload;
                break;
            }
        }
        messagePayload.payloadType = "message";
        this._currentPayload = messagePayload;
        return messagePayload;
    }
}
