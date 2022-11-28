import { ComponentChildren } from "preact";
import { open } from "@tauri-apps/api/dialog";

interface UploadBtnOptions {
    children?: ComponentChildren
    onChange?: (path: string) => void;
    className?: string | JSX.SignalLike<string | undefined>;
}

export function UploadBtn<FC>({ onChange, children, className }: UploadBtnOptions) {

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
        <button className={"mx-auto w-3/4 bg-primary text-white flex text-lg h-8 justify-center items-center leading-none rounded " + (className ? className : "")} onClick={handleUploadClick}>
            <span>{children}</span>
        </button>
    </>
}