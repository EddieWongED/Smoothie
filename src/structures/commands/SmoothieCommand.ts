import type {
    Command,
    CommandName,
} from "../../typings/structures/commands/SmoothieCommand.js";

export class SmoothieCommand<Key extends CommandName> {
    constructor(public name: Key, command: Command<Key>) {
        Object.assign(this, command);
    }
}
