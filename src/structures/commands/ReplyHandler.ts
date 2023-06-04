import type {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    TextChannel,
} from "discord.js";
import { getLocale } from "../../i18n/i18n.js";
import type { Language } from "../../typings/i18n/i18n.js";
import type {
    FollowUpArgs,
    ListReplyArgs,
    QueryArgs,
    ReplyArgs,
    SendArgs,
} from "../../typings/structures/commands/ReplyHandler.js";
import type {
    CommandPayload,
    MessageCommandPayload,
} from "../../typings/structures/commands/SmoothieCommand.js";
import ConfirmEmbed from "../embed/ConfirmEmbed.js";
import LevelEmbed from "../embed/LevelEmbed.js";
import PaginationEmbed from "../embed/PaginationEmbed.js";
import Logging from "../logging/Logging.js";
import createGuildPrefix from "../../utils/createGuildPrefix.js";
import { client } from "../../index.js";
import isInteger from "../../utils/isInteger.js";

export default class ReplyHandler {
    private _currentPayload: CommandPayload;
    private _isEditable = false;
    private _userId: string | undefined;
    private _guildId: string | null;

    constructor(
        payload: CommandPayload,
        public language: Language,
        public textChannelId: string | null
    ) {
        this._userId = payload.member?.user.id;
        this._guildId = payload.guildId;
        this._currentPayload = payload;
    }

    async info({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "info",
            title: titleString,
            description: descriptionString,
        });
        return this._reply(embed);
    }

    async success({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "success",
            title: titleString,
            description: descriptionString,
        });
        return this._reply(embed);
    }

    async warn({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "warn",
            title: titleString,
            description: descriptionString,
        });
        return this._reply(embed);
    }

    async error({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "error",
            title: titleString,
            description: descriptionString,
        });
        return this._reply(embed);
    }

    async infoFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: FollowUpArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "info",
            title: titleString,
            description: descriptionString,
        });
        return this._followUp(embed, willEdit);
    }

    async successFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: FollowUpArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "success",
            title: titleString,
            description: descriptionString,
        });
        return this._followUp(embed, willEdit);
    }

    async warnFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: FollowUpArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "warn",
            title: titleString,
            description: descriptionString,
        });
        return this._followUp(embed, willEdit);
    }

    async errorFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: FollowUpArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "error",
            title: titleString,
            description: descriptionString,
        });
        return this._followUp(embed, willEdit);
    }

    async infoSend({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: SendArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "info",
            title: titleString,
            description: descriptionString,
        });
        return this._send(embed, willEdit);
    }

    async successSend({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: SendArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "success",
            title: titleString,
            description: descriptionString,
        });
        return this._send(embed, willEdit);
    }

    async warnSend({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: SendArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "warn",
            title: titleString,
            description: descriptionString,
        });
        return this._send(embed, willEdit);
    }

    async errorSend({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: SendArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "error",
            title: titleString,
            description: descriptionString,
        });
        return this._send(embed, willEdit);
    }

    async confirm({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const footerString = getLocale(this.language, "confirmFooter", [
            (ConfirmEmbed.time / 1000 / 60).toString(),
        ]);
        const descriptionString = getLocale(
            this.language,
            description,
            descriptionArgs
        );
        const embed = ConfirmEmbed.create({
            title: titleString,
            description: descriptionString,
            footer: footerString,
        });
        const payload = await this._followUp(embed, false);

        try {
            const choice = await payload.awaitMessageComponent({
                filter: (interaction) =>
                    (this._userId === undefined ||
                        interaction.user.id === this._userId) &&
                    interaction.message.id === payload.id,
                time: ConfirmEmbed.time,
            });
            await choice.deferUpdate();
            await payload.delete();
            return choice.customId === "confirm";
        } catch (err) {
            await payload.delete();
            return false;
        }
    }

    async query({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        userId,
    }: QueryArgs) {
        if (!userId) {
            userId = this._userId;
        }
        const queryMessage = await this.infoSend({
            title: title,
            description: description,
            titleArgs: titleArgs,
            descriptionArgs: descriptionArgs,
            willEdit: false,
        });
        if (!queryMessage) return undefined;

        const channel = queryMessage.channel as TextChannel;
        const messages = await channel.awaitMessages({
            filter: (message) =>
                userId !== undefined &&
                message.member?.id !== undefined &&
                userId === message.member.id,
            max: 1,
            time: 60000,
        });

        await queryMessage.delete();

        return messages.first()?.content;
    }

    async list({
        title,
        list,
        titleArgs = [],
        itemsPerPage = 10,
    }: ListReplyArgs) {
        const titleString = getLocale(this.language, title, titleArgs);
        const footerString = getLocale(
            this.language,
            "buttonDisableTimeFooter",
            [(PaginationEmbed.idleTime / 1000 / 60).toString()]
        );
        const maxPage = Math.ceil(list.length / itemsPerPage);
        let page = 1;

        const embed = PaginationEmbed.create({
            title: titleString,
            list: list,
            page: page,
            footer: footerString,
            itemsPerPage: itemsPerPage,
        });
        const payload = await this._reply(embed);

        const collector = payload.channel.createMessageComponentCollector({
            filter: (interaction) => interaction.message.id === payload.id,
            idle: PaginationEmbed.idleTime,
        });

        collector.on("collect", async (interaction) => {
            await interaction.deferUpdate();
            switch (interaction.customId) {
                case "firstPage": {
                    page = 1;
                    break;
                }
                case "prevPage": {
                    page -= 1;
                    break;
                }
                case "nextPage": {
                    page += 1;
                    break;
                }
                case "lastPage": {
                    page = maxPage;
                    break;
                }
                case "choosePage": {
                    const content = await this.query({
                        title: "choosePageTitle",
                        description: "choosePageMessage",
                        descriptionArgs: [maxPage.toString()],
                        userId: interaction.user.id,
                    });

                    if (!content) break;

                    if (!isInteger(content)) {
                        await this.errorSend({
                            title: "errorTitle",
                            description: "choosePageNotIntegerMessage",
                            willEdit: false,
                        });
                        return;
                    }

                    const pageChosen = parseInt(content);
                    if (!(pageChosen <= maxPage && pageChosen >= 1)) {
                        await this.errorSend({
                            title: "errorTitle",
                            description: "choosePageNotWithinRangeMessage",
                            willEdit: false,
                        });
                        return;
                    }

                    page = pageChosen;
                    break;
                }
            }
            const embed = PaginationEmbed.create({
                title: titleString,
                list: list,
                page: page,
                footer: footerString,
                itemsPerPage: itemsPerPage,
            });
            await this._reply(embed);
        });

        collector.on("end", async () => {
            const embed = PaginationEmbed.create({
                title: titleString,
                list: list,
                page: page,
                footer: footerString,
                itemsPerPage: itemsPerPage,
            });
            if (!embed.components) return;
            embed.components.forEach((component) => {
                const row = component as ActionRowBuilder<ButtonBuilder>;
                row.components.forEach((button) => {
                    button.setDisabled(true);
                });
            });
            await this._reply(embed);
        });
    }

    private async _reply(embed: BaseMessageOptions) {
        if (this._isEditable) {
            return this._edit(embed);
        }

        const payload = (await this._currentPayload.reply(
            embed
        )) as MessageCommandPayload;
        payload.payloadType = "message";
        this._isEditable = true;
        this._currentPayload = payload;
        return payload;
    }

    private async _edit(embed: BaseMessageOptions) {
        let payload: MessageCommandPayload;
        switch (this._currentPayload.payloadType) {
            case "slash": {
                payload = (await this._currentPayload.editReply(
                    embed
                )) as MessageCommandPayload;
                break;
            }
            case "message": {
                payload = (await this._currentPayload.edit(
                    embed
                )) as MessageCommandPayload;
                break;
            }
        }
        payload.payloadType = "message";
        this._currentPayload = payload;
        return payload;
    }

    private async _followUp(embed: BaseMessageOptions, willEdit = true) {
        let payload: MessageCommandPayload;
        switch (this._currentPayload.payloadType) {
            case "slash": {
                payload = (await this._currentPayload.followUp(
                    embed
                )) as MessageCommandPayload;
                break;
            }
            case "message": {
                payload = (await this._currentPayload.reply(
                    embed
                )) as MessageCommandPayload;
                break;
            }
        }
        payload.payloadType = "message";
        if (willEdit) {
            this._currentPayload = payload;
        }
        return payload;
    }

    private async _send(embed: BaseMessageOptions, willEdit = true) {
        if (!this.textChannelId) {
            Logging.warn(
                createGuildPrefix(this._guildId),
                "Unable to send the message because textChannelId is not found."
            );
            return null;
        }
        const channel = client.channels.cache.get(this.textChannelId) as
            | TextChannel
            | undefined;
        if (!channel) {
            Logging.warn(
                createGuildPrefix(this._guildId),
                "Unable to send the message because the text channel is not found."
            );
            return null;
        }
        const payload = (await channel.send(embed)) as MessageCommandPayload;
        payload.payloadType = "message";
        if (willEdit) {
            this._currentPayload = payload;
        }
        return payload;
    }
}
