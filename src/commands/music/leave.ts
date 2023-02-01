import { client } from "../../index.js";
import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { SmoothieCommands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(SmoothieCommands.leave, {
    name: SmoothieCommands.leave,
    description: "The bot will leave your voice channel.",
    run: async ({ payload, reply }) => {
        const guildId = payload.guildId;
        if (!guildId) return;

        const voiceConnection = client.voiceConnections.get(guildId);
        if (!voiceConnection) {
            await reply.success("successTitle", "leaveSuccessMessage");
            return;
        }

        if (!voiceConnection.disconnect()) {
            await reply.error("errorTitle", "leaveFailedMessage");
            return;
        }

        await reply.success("successTitle", "leaveSuccessMessage");
        return;
    },
});
