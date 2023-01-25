import { SmoothieCommand } from "../../structures/SmoothieCommand.js";

export default new SmoothieCommand({
    name: "ping",
    description: "Reply with pong!",
    run: async ({ interaction }) => {
        await interaction.editReply("Pong!");
    },
});
