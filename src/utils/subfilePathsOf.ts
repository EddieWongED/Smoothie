import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";

const fileName = fileURLToPath(import.meta.url);
const currentPath = path.dirname(fileName);
const rootPath = currentPath.replace(/(\/utils)|()*$/g, "");

const subfilePathsOf = async (relativePath: string) => {
    return await glob(`${rootPath}/${relativePath}/**/*{.ts,.js}`);
};

export default subfilePathsOf;
