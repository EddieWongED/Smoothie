import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";

const fileName = fileURLToPath(import.meta.url);
const currentPath = path.dirname(fileName);
const rootPath = path.resolve(currentPath, '..');

const subfilePathsOf = async (relativePath: string) => {
    const pattern = path.join(rootPath, relativePath, '**/*{.ts,.js}');
    return await glob(pattern.replace(/\\/g, '/'));
};

export default subfilePathsOf;
