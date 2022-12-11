import { centralRegionAtom, clothesConfigAtom, hairConfigAtom, projectCacheAtom } from "@store/project.store";
import { useAtom } from "jotai";
import { ChangeEvent, createPortal, TargetedEvent } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";

import { writeBinaryFile } from "@tauri-apps/api/fs";
import { save } from "@tauri-apps/api/dialog";
import { globalMessageAtom } from "@store/message.store";
import { homeDir } from "@tauri-apps/api/path";
import { getFileExtension, getImageSize, getPreDirFormPath, loadLocalImage } from "@utils/fileopt";
import { create_preview_api, export_image, ProjectConfig } from "@backend/apis/project_apis";

interface PreViewProps {
    open?: boolean;
    onClose?: () => void;
}

const imageFormats = [{
    key: "png",
    label: "png",
    format: "image/png",
    extensions: ["png"]
}, {
    key: "jpg",
    label: "jpg",
    format: "image/jpg",
    extensions: ["jpg", "jpeg"]
}];

export function PreView<FC>({ open, onClose }: PreViewProps) {
    let container = document.querySelector("#preview")!;
    const [hairConfig] = useAtom(hairConfigAtom);
    const [clothesConfig] = useAtom(clothesConfigAtom);
    const [isSaving, updateIsSaving] = useState(false);
    const [projectCache, updateProjectCache] = useAtom(projectCacheAtom);
    const [, updateGlobalMessage] = useAtom(globalMessageAtom);
    const [centralConfig] = useAtom(centralRegionAtom);
    const [scale, updateScale] = useState(100);
    const [previewUrl, updatePreviewUrl] = useState("");
    const [previewSourcePath, updatePreviewSourcePath] = useState("");
    const [imageSize, updateImageSize] = useState({ width: 0, height: 0 });
    const [wrapperStyle, updateWrapperStyle] = useState<string | JSX.CSSProperties | JSX.SignalLike<string | JSX.CSSProperties>>({});
    const [creating, updateCreating] = useState(false);
    const createKeyRef = useRef("");

    const [exportFormat, updateExportFormat] = useState({
        key: "png",
        label: "png",
        format: "image/png",
        extensions: ["png"]
    });

    useEffect(() => {
        if (open) {
            updateCreating(true);
            setTimeout(async () => {
                if (open) {
                    let key = window.crypto.randomUUID();;
                    createKeyRef.current = key;
                    let config: ProjectConfig = {};
                    if (hairConfig.images.length) {
                        const { images, width, height, cols, colgap, rowgap, frame } = hairConfig;
                        config.hair = {
                            images: images.map(item => item.url),
                            width,
                            height,
                            cols,
                            colgap,
                            rowgap,
                        };
                        if (frame) {
                            let { source, width, height, top, right, bottom, left } = frame;
                            config.hair.frame_config = {
                                source,
                                width: width!,
                                height: height!,
                                top, right, bottom, left
                            };
                        }
                    }
                    if (clothesConfig.images.length) {
                        const { images, width, height, cols, colgap, rowgap, frame } = clothesConfig;
                        config.clothes = {
                            images: images.map(item => item.url),
                            width,
                            height,
                            cols,
                            colgap,
                            rowgap,
                        };
                        if (frame) {
                            let { source, width, height, top, right, bottom, left } = frame;
                            config.clothes.frame_config = {
                                source,
                                width: width!,
                                height: height!,
                                top, right, bottom, left
                            };
                        }
                    }
                    const preview_path = await create_preview_api(config);
                    if (createKeyRef.current !== key) {
                        return;
                    }
                    if (preview_path) {
                        let url = await loadLocalImage(preview_path);
                        let size = await getImageSize(preview_path);
                        updatePreviewUrl(url);
                        updateImageSize(size);
                        updatePreviewSourcePath(preview_path);
                    }
                    updateCreating(false);
                }
            }, 300)
        } else {
            updateIsSaving(false);
            updateCreating(false);
            updatePreviewUrl("");
            updatePreviewSourcePath("");
        }
    }, [open, hairConfig, clothesConfig])

    useEffect(() => {
        updateWrapperStyle({
            width: `${imageSize.width * scale / 100}px`,
            height: `${imageSize.height * scale / 100}px`
        });
    }, [imageSize, scale])

    function handleClose() {
        if (onClose && !isSaving) {
            onClose();
        }
    }

    async function saveImage() {
        if (creating) {
            return;
        }
        try {
            updateIsSaving(true);
            const extensions = exportFormat.extensions;
            let savePath = await save({
                filters: [{
                    name: "图像",
                    extensions
                }],
                defaultPath: projectCache.savePreDir || await homeDir()
            });
            if (savePath) {
                if (!extensions.includes(getFileExtension(savePath))) {
                    savePath = `${savePath}.${extensions[0]}`
                }
                let savePreDir = getPreDirFormPath(savePath);
                updateProjectCache((preData: any) => {
                    return {
                        ...preData,
                        savePreDir
                    }
                });
                await export_image(previewSourcePath, savePath, exportFormat.key);
                updateGlobalMessage({
                    type: "success",
                    message: "保存图片成功"
                });
            }
            updateIsSaving(false);
        } catch {
            updateGlobalMessage({
                type: "error",
                message: "保存图片失败"
            })
            updateIsSaving(false);
        }

    }

    function handleImageFormatChange(event: TargetedEvent<HTMLSelectElement, ChangeEvent>) {
        let value = event.currentTarget.value;
        let format = imageFormats.find(item => item.key === value);
        if (format) {
            updateExportFormat(format)
        }
    }

    function handleScaleChange(event: TargetedEvent<HTMLInputElement, ChangeEvent>) {
        let value = event.currentTarget.value;
        updateScale(Number(value));
    }

    if (!open) {
        return null;
    }
    return <>
        {
            createPortal(
                <div className="fixed top-0 right-0 bottom-0 left-0 z-10 bg-white flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-hidden p-2">
                        <div className="h-full w-full overflow-auto">
                            <div className="m-auto overflow-hidden" style={wrapperStyle} >
                                <img className="m-auto origin-top-left" src={previewUrl} style={{ width: "100%", height: "100%" }} />
                            </div>
                        </div>
                    </div>
                    <div className="flex overflow-hidden py-2 border-t border-solid border-t-gray-300">
                        <div className="flex-1"></div>
                        <div>
                            <button className="py-px px-2 rounded bg-primary text-white hover:ring-2 ring-primary" onClick={handleClose}>关闭</button>
                            <button className="ml-3 py-px px-2 rounded bg-primary text-white hover:ring-2 ring-primary disabled:bg-gray-500"
                                disabled={isSaving || creating}
                                onClick={saveImage}

                            >{isSaving ? "保存中" : "下载图片"}</button>
                            <select className="ml-3" onChange={handleImageFormatChange}>
                                {
                                    imageFormats.map(fmt => (<option key={fmt.key} value={fmt.key} checked={fmt.key === exportFormat.key}>{fmt.label}</option>))
                                }
                            </select>
                        </div>
                        <div className="flex-1 text-right">
                            <input type="range" max={100} min={10} value={scale} onChange={handleScaleChange} />
                            <span className="px-2">{scale}</span>
                        </div>
                    </div>
                </div>
                , container)
        }
    </>
}