import { useEffect, useState } from "preact/hooks";

interface ImageViewerProps {
    buffer?: Array<number>;
}

export function ImageViewer<FC>({ buffer }: ImageViewerProps) {
    const [url, updateUrl] = useState("");
    useEffect(() => {
        try {
            if (buffer) {

                const typedBuffer = new Uint8Array(buffer);
                const imgBlob = new Blob([typedBuffer], {
                    type: "image/png"
                });
                const url = window.URL.createObjectURL(imgBlob);
                updateUrl(url);
            } else {
                updateUrl("")
            }
        } catch {
            updateUrl("")
        }
    }, [buffer]);
    return <picture>
        <source srcset={url}></source>
        <img src={url} alt=""/>
    </picture>
}