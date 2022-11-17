import { JSX } from "preact";
import { open } from "@tauri-apps/api/dialog";
import { readBinaryFile } from "@tauri-apps/api/fs";

interface UploadBtnOptions {
    onChange?: (path:string) => void;
}

export function UploadBtn<FC>({ onChange }: UploadBtnOptions) {

    async function handleUploadClick() {
        let path = await open({
            filters: [{
                name: "image",
                extensions: ["png", "jpg", "jpeg"]
            }]
        });
        if (!path) {
            return;
        }
        if (onChange) {
            onChange(path as string)
        }

    }

    return <>
        <label className="w-full bg-primary text-white flex text-lg h-8 justify-center items-center leading-none rounded" onClick={handleUploadClick}>
            <span>选择图片</span>
        </label>
    </>
}