import type { ClientEvents } from "discord.js";

export class SmoothieEvent<Key extends keyof ClientEvents> {
    constructor(
        public event: Key,
        public run: (...args: ClientEvents[Key]) => Promise<void> | void
    ) {}
}
