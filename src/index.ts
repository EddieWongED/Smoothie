import dotenv from "dotenv";
import { SmoothieClient } from "./structures/SmoothieClient.js";

dotenv.config();

export const client = new SmoothieClient();

await client.start();
