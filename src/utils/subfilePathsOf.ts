import { promisify } from "util";
import glob from "glob";
import path from "path";
import { fileURLToPath } from "url";

const fileName = fileURLToPath(import.meta.url);
const currentPath = path.dirname(fileName);
const rootPath = currentPath.replace(/(\/utils)|()*$/g, "");

const globPromise = promisify(glob);

const subfilePathsOf = async (relativePath: string) => {
    return await globPromise(`${rootPath}/${relativePath}/**/*{.ts,.js}`);
};

export default subfilePathsOf;
