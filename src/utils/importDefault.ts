import Logging from "../structures/logging/Logging.js";
import { pathToFileURL } from "url";

const importDefault = async <T>(path: string): Promise<T | null> => {
    try {
        // Convert path to file:// URL for Windows compatibility
        const fileUrl = pathToFileURL(path).href;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const file: unknown = (await import(fileUrl))?.default;
        return file as T;
    } catch (err) {
        Logging.error(err);
        return null;
    }
};

export default importDefault;
