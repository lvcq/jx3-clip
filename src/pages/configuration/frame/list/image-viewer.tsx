import { readBinaryFile } from "@tauri-apps/api/fs";
import { useEffect, useState } from "preact/hooks";

interface ImageViewerProps {
    source?: string;
}

export function ImageViewer<FC>({ source }: ImageViewerProps) {
    const [url, updateUrl] = useState("");
        useEffect(() => {
            async function createSourceUrl() {
                if (source) {
                    const image = await readBinaryFile(source as string);
                    const imageBlob = new Blob([image]);
                    const url = window.URL.createObjectURL(imageBlob);
                    updateUrl(url);
                }else{
                    updateUrl("")
                }
            }
            createSourceUrl();
    }, [source]);
    return <img src={url} alt="" className="w-full max-h-full object-contain"></img>
}