import type { SmoothieCommandList } from "../../typings/structures/commands/SmoothieCommand.js";

export class SmoothieCommand<Key extends keyof SmoothieCommandList> {
    constructor(public name: Key, ...command: SmoothieCommandList[Key]) {
        Object.assign(this, ...command);
    }
}
