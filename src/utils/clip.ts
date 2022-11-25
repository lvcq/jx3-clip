import { readBinaryFile } from "@tauri-apps/api/fs";
import { roundPath } from "./draw-2d";

async function clipImage(source: string, top: number, right: number, bottom: number, left: number, radius: number) {
    const imageSource = await readBinaryFile(source as string);
    const imageBlob = new Blob([imageSource]);
    const url = window.URL.createObjectURL(imageBlob);
    const width = right - left;
    const height = bottom - top;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", String(width));
    canvas.setAttribute("height", String(height));
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);
    let image = await loadImage(url);
    let context = canvas.getContext("2d")!;
    context.clearRect(0, 0, width, height);
    roundPath({ x: 0, y: 0, width, height }, radius, context);
    context.clip();
    context.drawImage(image, left, top, width, height, 0, 0, width, height);
    let result = canvas.toDataURL('image/png');
    document.body.removeChild(canvas);
    return result;
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onload = () => {
            resolve(image);
        };
        image.onerror = () => {
            reject("Load error");
        };
    })
}

export async function clipImageTasks(sources: string[], top: number, right: number, bottom: number, left: number, radius: number) {
    let result: string[] = []
    for (let i = 0; i < sources.length; i += 6) {
        const sourceBatches = sources.slice(i, i + 6);
        let tasks = sourceBatches.map(item => clipImage(item, top, right, bottom, left, radius));
        let imgs = await Promise.all(tasks);
        result.push(...imgs);
    }
    return result;
}