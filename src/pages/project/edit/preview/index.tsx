import { centralRegionAtom, clothesConfigAtom, hairConfigAtom, projectCacheAtom } from "@store/project.store";
import { useAtom } from "jotai";
import { ChangeEvent, createPortal, TargetedEvent } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";

import { writeBinaryFile } from "@tauri-apps/api/fs";
import { save } from "@tauri-apps/api/dialog";
import { globalMessageAtom } from "@store/message.store";
import { homeDir } from "@tauri-apps/api/path";
import { getFileExtension, getPreDirFormPath, loadLocalImageObj } from "@utils/fileopt";

interface PreViewProps {
    open?: boolean;
    onClose?: () => void;
}

interface DrawOptions {
    originX: number;
    originY: number;
    images: string[];
    width: number;
    height: number;
    rowcap: number;
    colgap: number;
    cols: number;
    context: CanvasRenderingContext2D;
    remain: number;
    frameUrl?: string;
    frameWitdh?: number;
    frameHeight?: number;
    ptop?: number;
    pright?: number;
    pbottom?: number;
    pleft?: number;
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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasWidth, updateCanvasWidth] = useState(0);
    const [canvasHeight, updateCanvasHeight] = useState(0);
    const drawWaiter = useRef<number | null>(0);
    const [isSaving, updateIsSaving] = useState(false);
    const [projectCache, updateProjectCache] = useAtom(projectCacheAtom);
    const [, updateGlobalMessage] = useAtom(globalMessageAtom);
    const [centralConfig] = useAtom(centralRegionAtom);
    const [exportFormat, updateExportFormat] = useState({
        key: "png",
        label: "png",
        format: "image/png",
        extensions: ["png"]
    });

    useEffect(() => {
        return () => {
            if (drawWaiter.current) {
                cancelAnimationFrame(drawWaiter.current);
            }
        }
    })

    useEffect(() => {

        async function drawImages(options: DrawOptions) {
            let {
                originX,
                originY,
                images,
                width,
                height,
                cols,
                rowcap,
                colgap,
                context,
                remain,
                frameUrl,
                frameHeight,
                frameWitdh,
                ptop = 0,
                pright = 0,
                pbottom = 0,
                pleft = 0 } = options;
            let itemWith = width;
            let itemHeight = height;
            let frameImage: HTMLImageElement | null = null;
            if (frameUrl) {
                itemWith = frameWitdh!;
                itemHeight = frameHeight!;
                frameImage = await loadLocalImageObj(frameUrl);
            }
            let rows = Math.ceil(images.length / cols);
            for (let i = 0; i < rows; i++) {
                let startY = originY + i * (itemHeight + rowcap);
                for (let j = 0; j < cols; j++) {
                    let startX = originX + j * (itemWith + colgap);
                    if (j < remain) {
                        startX += 1;
                    }
                    let image = new Image();
                    image.onload = () => {
                        context.drawImage(image, startX + pleft, startY + ptop, width, height);
                        if (frameImage && frameWitdh && frameHeight) {
                            context.drawImage(frameImage, startX, startY, frameWitdh, frameHeight);
                        }
                    }
                    image.src = images[i * cols + j];
                }
            }
        }


        function waitToDraw(width: number, drawFun: () => void) {
            if (drawWaiter.current) {
                cancelAnimationFrame(drawWaiter.current);
            }
            if (open && canvasRef.current && canvasRef.current.offsetWidth === width) {
                drawFun();
            } else {
                drawWaiter.current = requestAnimationFrame(() => {
                    waitToDraw(width, drawFun);
                })
            }
        }

        function getCentralHeight() {
            return centralConfig.vPadding * 2;
        }

        if (open && canvasRef.current) {
            let hairimages = hairConfig.images;
            //根据是否有边框，计算单个图像宽高
            let hairItemWidth = (hairimages.length > 0) ? hairConfig.width : 0;
            let hairItemHeight = (hairimages.length > 0) ? hairConfig.height : 0;

            let hairPadding = {
                pt: 0,
                pr: 0,
                pb: 0,
                pl: 0
            };
            if (hairConfig.frame) {
                let { width, height, top, right, bottom, left } = hairConfig.frame;
                let innerWidth = right - left;
                let innerHeight = bottom - top;
                let hFactor = hairConfig.width / innerWidth;
                let vFactor = hairConfig.height / innerHeight;
                hairItemWidth = Math.floor(hFactor * width!);
                hairItemHeight = Math.floor(vFactor * height!);
                let pt = Math.floor(top * vFactor);
                let pr = Math.floor((width! - right) * hFactor);
                let pb = Math.floor((height! - bottom) * vFactor);
                let pl = Math.floor(left * hFactor);
                hairPadding = {
                    pt,
                    pr,
                    pb,
                    pl
                };
            }

            let clothesImages = clothesConfig.images;
            let clohtesItemWidth = (clothesImages.length > 0) ? hairConfig.width : 0;
            let clothesItemHeight = (clothesImages.length > 0) ? hairConfig.height : 0;
            let clothesPadding = {
                pt: 0,
                pr: 0,
                pb: 0,
                pl: 0
            };
            if (clothesConfig.frame) {
                let { width, height, top, right, bottom, left } = clothesConfig.frame;
                let innerWidth = right - left;
                let innerHeight = bottom - top;
                let hFactor = clothesConfig.width / innerWidth;
                let vFactor = clothesConfig.height / innerHeight;
                clohtesItemWidth = Math.floor(hFactor * width!);
                clothesItemHeight = Math.floor(vFactor * height!);
                let pt = Math.floor(top * vFactor);
                let pr = Math.floor((width! - right) * hFactor);
                let pb = Math.floor((height! - bottom) * vFactor);
                let pl = Math.floor(left * hFactor);
                clothesPadding = {
                    pt,
                    pr,
                    pb,
                    pl
                };
            }

            // 计算头发区域宽高

            let hairWidth = ((hairConfig.cols > 0) && (hairimages.length > 0)) ? (hairConfig.cols * hairItemWidth + (hairConfig.cols - 1) * hairConfig.colgap) : 0;
            let clothesWidth = clothesConfig.cols > 0 ? (clothesConfig.cols * clohtesItemWidth + (clothesConfig.cols - 1) * clothesConfig.colgap) : 0;
            let context = canvasRef.current.getContext("2d");
            if (!context) {
                return;
            }
            if (hairWidth === 0 && clothesWidth === 0) {
                return;
            } else if (clothesWidth === 0) {
                let rows = Math.ceil(hairimages.length / hairConfig.cols);
                let height = rows * hairItemHeight + (rows - 1) * hairConfig.rowgap;
                updateCanvasHeight(height);
                updateCanvasWidth(hairWidth);
                context.clearRect(0, 0, hairWidth, height);
                waitToDraw(hairWidth, () => {
                    drawImages({
                        originX: 0,
                        originY: 0,
                        images: hairimages.map(item => item.url),
                        width: hairConfig.width,
                        height: hairConfig.height,
                        rowcap: hairConfig.rowgap,
                        colgap: hairConfig.colgap,
                        cols: hairConfig.cols,
                        context: context!,
                        remain: 0,
                        frameUrl: hairConfig.frame?.source,
                        frameWitdh: hairItemWidth,
                        frameHeight: hairItemHeight,
                        ptop: hairPadding.pt,
                        pright: hairPadding.pr,
                        pbottom: hairPadding.pb,
                        pleft: hairPadding.pl,
                    });
                })
            } else if (hairWidth === 0) {
                let rows = Math.ceil(clothesConfig.images.length / clothesConfig.cols);
                let height = rows * clothesItemHeight + (rows - 1) * clothesConfig.rowgap;
                updateCanvasHeight(height);
                updateCanvasWidth(clothesWidth);
                waitToDraw(clothesWidth, () => {
                    drawImages({
                        originX: 0,
                        originY: 0,
                        images: clothesConfig.images.map(item => item.url),
                        width: clothesConfig.width,
                        height: clothesConfig.height,
                        rowcap: clothesConfig.rowgap,
                        colgap: clothesConfig.colgap,
                        cols: clothesConfig.cols,
                        context: context!,
                        remain: 0,
                        frameUrl: clothesConfig.frame?.source,
                        frameWitdh: clohtesItemWidth,
                        frameHeight: clothesItemHeight,
                        ptop: clothesPadding.pt,
                        pright: clothesPadding.pr,
                        pbottom: clothesPadding.pb,
                        pleft: clothesPadding.pl,
                    });
                });
            } else {
                const renderWith = Math.min(hairWidth, clothesWidth);
                let hairImageWidth = hairConfig.width;
                let hairImageHeight = hairConfig.height;
                let hairRemain = 0;
                let clothesImageWidth = clothesConfig.width;
                let clothesImageHeight = clothesConfig.height;
                let clothesRemain = 0;
                if (clothesWidth > hairWidth) {
                    clothesImageWidth = Math.floor((renderWith - (clothesConfig.cols - 1) * clothesConfig.colgap) / clothesConfig.cols);
                    clothesImageHeight = Math.round((clothesImageHeight * clothesImageWidth / clothesConfig.width));
                    clothesRemain = (renderWith - (clothesImageWidth * clothesConfig.cols + (clothesConfig.cols - 1) * clothesConfig.colgap));
                }
                if (hairWidth > clothesWidth) {
                    hairImageWidth = Math.floor((renderWith - (hairConfig.cols - 1) * hairConfig.colgap) / hairConfig.cols);
                    hairImageHeight = Math.round((hairImageHeight * hairImageWidth / hairConfig.width));
                    hairRemain = (renderWith - (hairImageWidth * hairConfig.cols + (hairConfig.cols - 1) * hairConfig.colgap));
                }
                let hairRows = Math.ceil(hairimages.length / hairConfig.cols);
                let hairAreaHeight = hairRows * hairImageHeight + (hairRows - 1) * hairConfig.rowgap;
                let clothesRows = Math.ceil(clothesConfig.images.length / clothesConfig.cols);
                let clothesAreaHeight = clothesRows * clothesImageHeight + (clothesRows - 1) * clothesConfig.rowgap;
                let centralHeight = getCentralHeight();
                let renderHeight = hairAreaHeight + clothesAreaHeight + centralHeight;
                updateCanvasHeight(renderHeight);
                updateCanvasWidth(renderWith);
                waitToDraw(renderWith, () => {
                    drawImages({
                        originX: 0,
                        originY: 0,
                        images: hairConfig.images.map(item => item.url),
                        width: hairImageWidth,
                        height: hairImageHeight,
                        rowcap: hairConfig.rowgap,
                        colgap: hairConfig.colgap,
                        cols: hairConfig.cols,
                        context: context!,
                        remain: hairRemain,
                        frameUrl: clothesConfig.frame?.source,
                        frameWitdh: clohtesItemWidth,
                        frameHeight: clothesItemHeight,
                        ptop: clothesPadding.pt,
                        pright: clothesPadding.pr,
                        pbottom: clothesPadding.pb,
                        pleft: clothesPadding.pl,
                    });
                    drawImages({
                        originX: 0,
                        originY: hairAreaHeight + centralHeight,
                        images: clothesConfig.images.map(item => item.url),
                        width: clothesImageWidth,
                        height: clothesImageHeight,
                        rowcap: clothesConfig.rowgap,
                        colgap: clothesConfig.colgap,
                        cols: clothesConfig.cols,
                        context: context!,
                        remain: clothesRemain,
                        frameUrl: clothesConfig.frame?.source,
                        frameWitdh: clohtesItemWidth,
                        frameHeight: clothesItemHeight,
                        ptop: clothesPadding.pt,
                        pright: clothesPadding.pr,
                        pbottom: clothesPadding.pb,
                        pleft: clothesPadding.pl,
                    });
                });
            }

        }
    }, [hairConfig, clothesConfig, open]);

    function handleClose() {
        if (onClose && !isSaving) {
            onClose();
        }
    }

    async function saveImage() {
        if (canvasRef.current) {
            try {
                updateIsSaving(true);
                canvasRef.current.toBlob(async (blob) => {
                    const extensions = exportFormat.extensions;
                    if (blob) {
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
                            const imgArr = new Uint8Array(await blob.arrayBuffer());
                            await writeBinaryFile(savePath, imgArr, {
                            });
                            updateGlobalMessage({
                                type: "success",
                                message: "保存图片成功"
                            });
                        }
                    }
                    updateIsSaving(false)
                }, exportFormat.format);
            } catch {
                updateGlobalMessage({
                    type: "error",
                    message: "保存图片失败"
                })
                updateIsSaving(false);
            }

        }
    }

    function handleImageFormatChange(event: TargetedEvent<HTMLSelectElement, ChangeEvent>) {
        let value = event.currentTarget.value;
        let format = imageFormats.find(item => item.key === value);
        if (format) {
            updateExportFormat(format)
        }
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
                            <canvas className="m-auto" ref={canvasRef} width={canvasWidth} height={canvasHeight} />
                        </div>
                    </div>
                    <div className="flex overflow-hidden py-2 border-t border-solid border-t-gray-300">
                        <div className="flex-1"></div>
                        <div>
                            <button className="py-px px-2 rounded bg-primary text-white hover:ring-2 ring-primary" onClick={handleClose}>关闭</button>
                            <button className="ml-3 py-px px-2 rounded bg-primary text-white hover:ring-2 ring-primary disabled:bg-gray-500"
                                disabled={isSaving}
                                onClick={saveImage}

                            >{isSaving ? "保存中" : "下载图片"}</button>
                            <select className="ml-3" onChange={handleImageFormatChange}>
                                {
                                    imageFormats.map(fmt => (<option key={fmt.key} value={fmt.key} checked={fmt.key === exportFormat.key}>{fmt.label}</option>))
                                }
                            </select>
                        </div>
                        <div className="flex-1"></div>
                    </div>
                </div>
                , container)
        }
    </>
}