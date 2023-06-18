import { SmoothieCommand } from "../../structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default new SmoothieCommand(Commands.test, {
    name: Commands.test,
    description: "For developer testing only!",
    run: () => {
        return;
    },
});
