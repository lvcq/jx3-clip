import { readBinaryFile, BaseDirectory, exists } from "@tauri-apps/api/fs";

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

// 获取文件后缀
export function getFileExtension(path: string): string {
    const len = path.length;
    let index = len - 1;
    while (index >= 0 && path[index] !== "/" && path[index] !== "\\") {
        if (path[index] === ".") {
            return path.substring(index + 1);
        }
        index -= 1;
    }
    return "";
}

/**
 * 加载本地图像，返回图像对象
 */
export async function loadLocalImageObj(source: string): Promise<HTMLImageElement> {
    let url = await loadLocalImage(source);
    return new Promise((resolve) => {
        let img = new Image();

        img.onload = () => {
            resolve(img);
        }
        img.src = url;
    })
}

export async function getImageSize(source: string): Promise<{ width: number; height: number }> {
    let url = await loadLocalImage(source);
    return new Promise((resolve) => {
        let img = new Image();

        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight
            });
        }
        img.src = url;
    })
}

export async function checkProjectExists(name: string): Promise<boolean> {
    let projectPath = `projects/${name}`;
    return exists(projectPath)
}