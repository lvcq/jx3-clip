import { readBinaryFile } from "@tauri-apps/api/fs";

export function getPreDirFormPath(path: string) {
    const len = path.length;
    let index = len - 1;
    while (index >= 0 && (path.charAt(index) !== "/" && path.charAt(index) !== "\\")) {
        index -= 1;
    }
    return path.substring(0, index);
}


/**
 * 加载磁盘中的图像，返回访问地址
 */
export async function loadLocalImage(source: string): Promise<string> {
    try {
        const image = await readBinaryFile(source);
        const imageBlob = new Blob([image]);
        const url = window.URL.createObjectURL(imageBlob);
        return url;
    } catch (err) {
        throw err;
    }
}