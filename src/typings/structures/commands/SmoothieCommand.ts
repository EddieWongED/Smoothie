import type {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    Message,
    PermissionResolvable,
} from "discord.js";
import type ReplyHandler from "../../../structures/commands/ReplyHandler.js";
import type GuildDataHandler from "../../../structures/database/GuildDataHandler.js";
import type OptionsOptions from "../../commands/dev/OptionsOptions.js";
import type LanguageOptions from "../../commands/general/LanguageOptions.js";
import type PingOptions from "../../commands/general/PingOptions.js";
import type PrefixOptions from "../../commands/general/PrefixOptions.js";
import type JoinOptions from "../../commands/music/JoinOptions.js";
import type LeaveOptions from "../../commands/music/LeaveOptions.js";
import type CreatePlaylistOptions from "../../commands/music/playlist/CreatePlaylistOptions.js";
import type GuildStatesHandler from "../../../structures/database/GuildStatesHandler.js";
import type RemovePlaylistOptions from "../../commands/music/playlist/RemovePlaylistOptions.js";
import type TestOptions from "../../commands/dev/TestOptions.js";
import type ListPlaylistOptions from "../../commands/music/playlist/ListPlaylistOptions.js";
import type PlaylistOptions from "../../commands/music/playlist/PlaylistOptions.js";
import type InfoPlaylistOptions from "../../commands/music/playlist/InfoPlaylistOptions.js";
import type SwitchPlaylistOptions from "../../commands/music/playlist/SwitchPlaylistOptions.js";
import type PlayOptions from "../../commands/music/PlayOptions.js";
import type QueueOptions from "../../commands/music/QueueOptions.js";
import type SkipOptions from "../../commands/music/SkipOptions.js";
import type RemoveOptions from "../../commands/music/RemoveOptions.js";
import type PauseOptions from "../../commands/music/PauseOptions.js";
import type UnpauseOptions from "../../commands/music/UnpauseOptions.js";
import type RetryOptions from "../../commands/music/RetryOptions.js";

// Payload
export type SlashCommandPayload = ChatInputCommandInteraction & {
    payloadType: "slash";
};

export type MessageCommandPayload = Message & { payloadType: "message" };

export type CommandPayload = SlashCommandPayload | MessageCommandPayload;

// Command options
export type NoOptions = Record<string, never>;

/** Update when adding new command **/
export enum Commands {
    test = "test",
    ping = "ping",
    options = "options",
    language = "language",
    prefix = "prefix",
    join = "join",
    leave = "leave",
    play = "play",
    pause = "pause",
    unpause = "unpause",
    playlist = "playlist",
    queue = "queue",
    skip = "skip",
    retry = "retry",
    remove = "remove",
    createPlaylist = "createplaylist",
    removePlaylist = "removeplaylist",
    listPlaylist = "listplaylist",
    infoPlaylist = "infoplaylist",
    switchPlaylist = "switchplaylist",
}

/** Update when adding new command **/
interface CommandOptionsList {
    [Commands.test]: TestOptions;
    [Commands.ping]: PingOptions;
    [Commands.options]: OptionsOptions;
    [Commands.language]: LanguageOptions;
    [Commands.prefix]: PrefixOptions;
    [Commands.join]: JoinOptions;
    [Commands.leave]: LeaveOptions;
    [Commands.play]: PlayOptions;
    [Commands.pause]: PauseOptions;
    [Commands.unpause]: UnpauseOptions;
    [Commands.playlist]: PlaylistOptions;
    [Commands.queue]: QueueOptions;
    [Commands.skip]: SkipOptions;
    [Commands.retry]: RetryOptions;
    [Commands.remove]: RemoveOptions;
    [Commands.createPlaylist]: CreatePlaylistOptions;
    [Commands.removePlaylist]: RemovePlaylistOptions;
    [Commands.listPlaylist]: ListPlaylistOptions;
    [Commands.infoPlaylist]: InfoPlaylistOptions;
    [Commands.switchPlaylist]: SwitchPlaylistOptions;
}

// Command
export type CommandName = keyof CommandOptionsList;

interface CommandArgs<Name extends keyof CommandOptionsList> {
    guildId: string;
    payload: CommandPayload;
    options: CommandOptionsList[Name];
    guildData: GuildDataHandler;
    guildStates: GuildStatesHandler;
    reply: ReplyHandler;
}

export type Command<Name extends CommandName = CommandName> = {
    userPermission?: PermissionResolvable[];
    aliases?: string[];
    run: (args: CommandArgs<Name>) => Promise<void> | void;
} & ChatInputApplicationCommandData;
