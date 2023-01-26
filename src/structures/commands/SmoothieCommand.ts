import type { SmoothieCommandType } from "../../typings/structures/commands/SmoothieCommand.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SmoothieCommand {
    constructor(command: SmoothieCommandType) {
        Object.assign(this, command);
    }
}
