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
import SmoothieEmbed from "../embed/SmoothieEmbed.js";
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
        title: keyof Internationalization,
        description: keyof Internationalization,
        titleArgs: string[] = [],
        descriptionArgs: string[] = []
    ): Promise<CommandReplyResponse | null> {
        if (this._isEditable) {
            return this._edit(
                level,
                title,
                description,
                titleArgs,
                descriptionArgs
            );
        }
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const response = SmoothieEmbed.create(
            level,
            titleString,
            descriptionString
        );
        let payload: CommandReplyResponse;
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

    async success(
        title: keyof Internationalization,
        description: keyof Internationalization,
        titleArgs: string[] = [],
        descriptionArgs: string[] = []
    ): Promise<CommandReplyResponse | null> {
        return this.reply(
            "success",
            title,
            description,
            titleArgs,
            descriptionArgs
        );
    }

    async info(
        title: keyof Internationalization,
        description: keyof Internationalization,
        titleArgs: string[] = [],
        descriptionArgs: string[] = []
    ): Promise<CommandReplyResponse | null> {
        return this.reply(
            "info",
            title,
            description,
            titleArgs,
            descriptionArgs
        );
    }

    async warn(
        title: keyof Internationalization,
        description: keyof Internationalization,
        titleArgs: string[] = [],
        descriptionArgs: string[] = []
    ): Promise<CommandReplyResponse | null> {
        return this.reply(
            "warn",
            title,
            description,
            titleArgs,
            descriptionArgs
        );
    }

    async error(
        title: keyof Internationalization,
        description: keyof Internationalization,
        titleArgs: string[] = [],
        descriptionArgs: string[] = []
    ): Promise<CommandReplyResponse | null> {
        return this.reply(
            "error",
            title,
            description,
            titleArgs,
            descriptionArgs
        );
    }

    async followUp(
        level: ReplyLevel,
        title: keyof Internationalization,
        description: keyof Internationalization,
        titleArgs: string[] = [],
        descriptionArgs: string[] = []
    ): Promise<MessageCommandPayload | null> {
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
        const response = SmoothieEmbed.create(
            level,
            titleString,
            descriptionString
        );
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

    async successFollowUp(
        title: keyof Internationalization,
        description: keyof Internationalization,
        titleArgs: string[] = [],
        descriptionArgs: string[] = []
    ): Promise<CommandReplyResponse | null> {
        return this.followUp(
            "success",
            title,
            description,
            titleArgs,
            descriptionArgs
        );
    }

    async infoFollowUp(
        title: keyof Internationalization,
        description: keyof Internationalization,
        titleArgs: string[] = [],
        descriptionArgs: string[] = []
    ): Promise<CommandReplyResponse | null> {
        return this.followUp(
            "info",
            title,
            description,
            titleArgs,
            descriptionArgs
        );
    }

    async warnFollowUp(
        title: keyof Internationalization,
        description: keyof Internationalization,
        titleArgs: string[] = [],
        descriptionArgs: string[] = []
    ): Promise<CommandReplyResponse | null> {
        return this.followUp(
            "warn",
            title,
            description,
            titleArgs,
            descriptionArgs
        );
    }

    async errorFollowUp(
        title: keyof Internationalization,
        description: keyof Internationalization,
        titleArgs: string[] = [],
        descriptionArgs: string[] = []
    ): Promise<CommandReplyResponse | null> {
        return this.followUp(
            "error",
            title,
            description,
            titleArgs,
            descriptionArgs
        );
    }

    private async _edit(
        level: ReplyLevel,
        title: keyof Internationalization,
        description: keyof Internationalization,
        titleArgs: string[] = [],
        descriptionArgs: string[] = []
    ): Promise<MessageCommandPayload | null> {
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
        const response = SmoothieEmbed.create(
            level,
            titleString,
            descriptionString
        );
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
