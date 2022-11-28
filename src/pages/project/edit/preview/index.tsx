import { centralRegionAtom, clothesConfigAtom, hairConfigAtom, projectCacheAtom } from "@store/project.store";
import { useAtom } from "jotai";
import { createPortal } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";

import { BaseDirectory, writeBinaryFile } from "@tauri-apps/api/fs";
import { save } from "@tauri-apps/api/dialog";
import { globalMessageAtom } from "@store/message.store";
import { homeDir } from "@tauri-apps/api/path";
import { getPreDirFormPath } from "@utils/fileopt";

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
}

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
    const [centralConfig]=useAtom(centralRegionAtom);

    useEffect(() => {
        return () => {
            if (drawWaiter.current) {
                cancelAnimationFrame(drawWaiter.current);
            }
        }
    })

    useEffect(() => {

        function drawImages(options: DrawOptions) {
            let { originX, originY, images, width, height, cols, rowcap, colgap, context, remain } = options;
            let rows = Math.ceil(images.length / cols);
            for (let i = 0; i < rows; i++) {
                let startY = originY + i * (height + rowcap);
                for (let j = 0; j < cols; j++) {
                    let startX = originX + j * (width + colgap);
                    if (j < remain) {
                        startX += 1;
                    }
                    let image = new Image();
                    image.onload = () => {
                        context.drawImage(image, startX, startY, width, height);
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

        function getCentralHeight(){
            return centralConfig.vPadding*2;
        }

        if (open && canvasRef.current) {
            // 计算头发区域宽高
            let hairimages = hairConfig.images;
            let hairWidth = hairConfig.cols > 0 ? (hairConfig.cols * hairConfig.width + (hairConfig.cols - 1) * hairConfig.colgap) : 0;
            let clothesWidth = clothesConfig.cols > 0 ? (clothesConfig.cols * clothesConfig.width + (clothesConfig.cols - 1) * clothesConfig.colgap) : 0;
            let context = canvasRef.current.getContext("2d");
            if (!context) {
                return;
            }
            if (hairWidth === 0 && clothesWidth === 0) {
                return;
            } else if (clothesWidth === 0) {
                let rows = Math.ceil(hairimages.length / hairConfig.cols);
                let height = rows * hairConfig.height + (rows - 1) * hairConfig.rowgap;
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
                        remain: 0
                    });
                })
            } else if (hairWidth === 0) {
                let rows = Math.ceil(clothesConfig.images.length / clothesConfig.cols);
                let height = rows * clothesConfig.height + (rows - 1) * clothesConfig.rowgap;
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
                        remain: 0
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
                let renderHeight = hairAreaHeight + clothesAreaHeight+centralHeight;
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
                        remain: hairRemain
                    });
                    drawImages({
                        originX: 0,
                        originY: hairAreaHeight+centralHeight,
                        images: clothesConfig.images.map(item => item.url),
                        width: clothesImageWidth,
                        height: clothesImageHeight,
                        rowcap: clothesConfig.rowgap,
                        colgap: clothesConfig.colgap,
                        cols: clothesConfig.cols,
                        context: context!,
                        remain: clothesRemain
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
                    if (blob) {
                        let savePath = await save({
                            filters: [{
                                name: "图像",
                                extensions: ["png"]
                            }],
                            defaultPath: projectCache.savePreDir || await homeDir()
                        });
                        if (savePath) {
                            if (!savePath.endsWith(".png")) {
                                savePath = `${savePath}.png`
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
                }, "image/png");
            } catch {
                updateGlobalMessage({
                    type: "error",
                    message: "保存图片失败"
                })
                updateIsSaving(false);
            }

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
                    <div className="text-center py-2 border-t border-solid border-t-gray-300">
                        <button className="py-px px-2 rounded bg-primary text-white hover:ring-2 ring-primary" onClick={handleClose}>关闭</button>
                        <button className="ml-3 py-px px-2 rounded bg-primary text-white hover:ring-2 ring-primary disabled:bg-gray-500"
                            disabled={isSaving}
                            onClick={saveImage}

                        >{isSaving ? "保存中" : "下载图片"}</button>
                    </div>
                </div>
                , container)
        }
    </>
}