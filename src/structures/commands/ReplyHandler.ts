import type {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    Collection,
    Message,
    Snowflake,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    TextChannel,
} from "discord.js";
import { ComponentType } from "discord.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import type {
    FollowUpArgs,
    ListReplyArgs,
    OptionsArgs,
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
import GuildDataHandler from "../database/GuildDataHandler.js";
import GuildStatesHandler from "../database/GuildStatesHandler.js";
import OptionsEmbed from "../embed/OptionsEmbed.js";

export default class ReplyHandler {
    private _currentPayload: CommandPayload | undefined;
    private _isEditable = false;
    private _userId: string | undefined;
    private _guildId: string;
    private _guildPrefix: string;
    private _guildData: GuildDataHandler;
    private _guildStates: GuildStatesHandler;

    constructor({
        payload,
        guildId,
    }: {
        payload?: CommandPayload;
        guildId: string;
    }) {
        this._guildId = guildId;
        this._userId = payload?.member?.user.id;
        this._currentPayload = payload;
        this._guildData = new GuildDataHandler(guildId);
        this._guildStates = new GuildStatesHandler(guildId);
        this._guildPrefix = createGuildPrefix(this._guildId);
    }

    async info({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "info",
            title: titleString,
            description: descriptionString,
        });
        return this.reply(embed);
    }

    async success({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "success",
            title: titleString,
            description: descriptionString,
        });
        return this.reply(embed);
    }

    async warn({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "warn",
            title: titleString,
            description: descriptionString,
        });
        return this.reply(embed);
    }

    async error({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "error",
            title: titleString,
            description: descriptionString,
        });
        return this.reply(embed);
    }

    async infoFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: FollowUpArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "info",
            title: titleString,
            description: descriptionString,
        });
        return this.followUp(embed, willEdit);
    }

    async successFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: FollowUpArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "success",
            title: titleString,
            description: descriptionString,
        });
        return this.followUp(embed, willEdit);
    }

    async warnFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: FollowUpArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "warn",
            title: titleString,
            description: descriptionString,
        });
        return this.followUp(embed, willEdit);
    }

    async errorFollowUp({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: FollowUpArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "error",
            title: titleString,
            description: descriptionString,
        });
        return this.followUp(embed, willEdit);
    }

    async infoSend({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: SendArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "info",
            title: titleString,
            description: descriptionString,
        });
        return this.send(embed, willEdit);
    }

    async successSend({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: SendArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "success",
            title: titleString,
            description: descriptionString,
        });
        return this.send(embed, willEdit);
    }

    async warnSend({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: SendArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "warn",
            title: titleString,
            description: descriptionString,
        });
        return this.send(embed, willEdit);
    }

    async errorSend({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        willEdit = true,
    }: SendArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = LevelEmbed.create({
            level: "error",
            title: titleString,
            description: descriptionString,
        });
        return this.send(embed, willEdit);
    }

    async confirm({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
    }: ReplyArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const footerString = getLocale(language, "confirmFooter", [
            (ConfirmEmbed.time / 1000 / 60).toString(),
        ]);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const embed = ConfirmEmbed.create({
            title: titleString,
            description: descriptionString,
            footer: footerString,
        });
        const payload = await this.followUp(embed, false);
        if (!payload) return false;

        let decision = false;
        try {
            const interaction = await payload.awaitMessageComponent({
                filter: (interaction) =>
                    (this._userId === undefined ||
                        interaction.user.id === this._userId) &&
                    interaction.message.id === payload.id &&
                    interaction.componentType === ComponentType.Button,
                time: ConfirmEmbed.time,
            });
            await interaction.deferUpdate();
            decision = interaction.customId === "confirm";
        } catch (err) {
            decision = false;
        }

        try {
            await payload.delete();
        } catch (err) {
            Logging.warn(
                this._guildPrefix,
                "Failed to delete confirm message."
            );
        }
        return decision;
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
        if (!queryMessage) return null;

        const channel = queryMessage.channel as TextChannel;
        let messages: Collection<Snowflake, Message> | null = null;

        try {
            messages = await channel.awaitMessages({
                filter: (message) =>
                    userId !== undefined &&
                    message.member?.id !== undefined &&
                    userId === message.member.id,
                max: 1,
                time: 60000,
            });
        } catch (err) {
            messages = null;
        }
        if (!messages) return null;

        try {
            await queryMessage.delete();
        } catch (err) {
            Logging.warn(this._guildPrefix, "Failed to delete query message.");
        }

        return messages.first()?.content;
    }

    async options({
        title,
        description,
        titleArgs = [],
        descriptionArgs = [],
        options,
    }: OptionsArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const descriptionString = getLocale(
            language,
            description,
            descriptionArgs
        );
        const placeholder = getLocale(language, "selectMenuPlaceholder", []);
        const footerString = getLocale(
            language,
            "selectMenuDisableTimeFooter",
            [(OptionsEmbed.time / 1000 / 60).toString()]
        );

        const embed = OptionsEmbed.create({
            title: titleString,
            description: descriptionString,
            footer: footerString,
            options: options,
            placeholder: placeholder,
        });
        const payload = await this.reply(embed);
        if (!payload) return null;

        let decision: string | null = null;
        try {
            const interaction = (await payload.awaitMessageComponent({
                filter: (interaction) =>
                    interaction.message.id === payload.id &&
                    interaction.componentType === ComponentType.StringSelect,
                time: OptionsEmbed.time,
            })) as StringSelectMenuInteraction;
            await interaction.deferUpdate();
            if (interaction.customId.startsWith(OptionsEmbed.customIdPrefix)) {
                decision = interaction.values[0] ? interaction.values[0] : null;
            }
        } catch (err) {
            decision = null;
        }

        if (!embed.components) return null;
        embed.components.forEach((component) => {
            const row = component as ActionRowBuilder<StringSelectMenuBuilder>;
            row.components.forEach((menu) => {
                menu.setDisabled(true);
            });
        });

        await this.reply(embed);

        return decision;
    }

    async list({
        title,
        list,
        titleArgs = [],
        itemsPerPage = 10,
        indexing = true,
    }: ListReplyArgs) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const titleString = getLocale(language, title, titleArgs);
        const footerString = getLocale(language, "buttonDisableTimeFooter", [
            (PaginationEmbed.idleTime / 1000 / 60).toString(),
        ]);
        const maxPage = Math.ceil(list.length / itemsPerPage);
        let page = 1;

        const embed = PaginationEmbed.create({
            title: titleString,
            list: list,
            page: page,
            footer: footerString,
            itemsPerPage: itemsPerPage,
            indexing: indexing,
        });
        const payload = await this.reply(embed);
        if (!payload) return null;

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

                    if (!Number.isInteger(Number(content))) {
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
                indexing: indexing,
            });
            await this.reply(embed);
        });

        collector.on("end", async () => {
            const embed = PaginationEmbed.create({
                title: titleString,
                list: list,
                page: page,
                footer: footerString,
                itemsPerPage: itemsPerPage,
                indexing: indexing,
            });
            if (!embed.components) return;
            embed.components.forEach((component) => {
                const row = component as ActionRowBuilder<ButtonBuilder>;
                row.components.forEach((button) => {
                    button.setDisabled(true);
                });
            });
            await this.reply(embed);
        });

        return payload;
    }

    async reply(embed: BaseMessageOptions) {
        // Send instead of reply if no playload is given
        if (!this._currentPayload) {
            return this.send(embed);
        }

        // Edit instead of reply if we can edit the payload
        if (this._isEditable) {
            return this._edit(embed);
        }

        try {
            const payload = (await this._currentPayload.reply(
                embed
            )) as MessageCommandPayload;
            payload.payloadType = "message";
            this._isEditable = true;
            this._currentPayload = payload;
            return payload;
        } catch (err) {
            Logging.warn(this._guildPrefix, "Failed to reply the message.");
            return null;
        }
    }

    private async _edit(embed: BaseMessageOptions) {
        // Return null if there is no payload is given
        if (!this._currentPayload) {
            return null;
        }

        try {
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
        } catch (err) {
            Logging.error(err);
            Logging.warn(this._guildPrefix, "Failed to edit the message.");
            return null;
        }
    }

    async followUp(embed: BaseMessageOptions, willEdit = true) {
        // Send instead of followUp if no playload is given
        if (!this._currentPayload) {
            return this.send(embed);
        }

        try {
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
                this._isEditable = true;
            }
            return payload;
        } catch (err) {
            Logging.warn(
                this._guildPrefix,
                "Failed to send a follow up message."
            );
            return null;
        }
    }

    async send(embed: BaseMessageOptions, willEdit = true) {
        const textChannelId = await this._guildStates.get("textChannelId");
        if (!textChannelId) {
            Logging.warn(
                this._guildPrefix,
                "Unable to send the message because textChannelId is not found."
            );
            return null;
        }
        const channel = client.channels.cache.get(textChannelId) as
            | TextChannel
            | undefined;
        if (!channel) {
            Logging.warn(
                this._guildPrefix,
                "Unable to send the message because the text channel is not found."
            );
            return null;
        }

        try {
            const payload = (await channel.send(
                embed
            )) as MessageCommandPayload;
            payload.payloadType = "message";
            if (willEdit) {
                this._currentPayload = payload;
                this._isEditable = true;
            }
            return payload;
        } catch (err) {
            Logging.warn(this._guildPrefix, "Failed to send a message.");
            return null;
        }
    }

    setPayload(payload: CommandPayload) {
        this._currentPayload = payload;
    }
}
