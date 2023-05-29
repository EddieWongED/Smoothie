import Logging from "../structures/logging/Logging.js";

const importDefault = async <T>(path: string): Promise<T | null> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const file: unknown = (await import(path))?.default;
        return file as T;
    } catch (err) {
        Logging.error(err);
        return null;
    }
};

export default importDefault;
