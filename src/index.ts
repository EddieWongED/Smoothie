import dotenv from "dotenv";
import { SmoothieClient } from "./structures/client/SmoothieClient.js";

dotenv.config();

export const client = new SmoothieClient();

void (async () => {
    await client.start();
})();
