import { clipExampleImage, clipParamsAtom } from "@store/clip-config.store";
import { drawRoundedRect } from "@utils/draw-2d";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "preact/hooks";

interface DrawImageProps {

}

const bgColors = ["#333333", "#999999"]

export function DrawImage<FC>({ }: DrawImageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const monitor = useRef<number>(0);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);
    const canvasContext = useRef<CanvasRenderingContext2D | null>(null);
    const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
    const [url] = useAtom(clipExampleImage)
    const [clipParams] = useAtom(clipParamsAtom);
    const urlRef = useRef(url);

    useEffect(() => {
        function monitorCanvasSize() {
            const width = canvasRef.current?.offsetWidth;
            const height = canvasRef.current?.offsetHeight;
            setCanvasWidth(width || 0);
            setCanvasHeight(height || 0);
            monitor.current = requestAnimationFrame(() => {
                monitorCanvasSize();
            });
        }
        function initializeContext() {
            if (canvasRef.current) {
                canvasContext.current = canvasRef.current.getContext('2d')
            }
        }
        monitorCanvasSize();
        initializeContext();

        return () => {
            if (monitor.current) {
                cancelAnimationFrame(monitor.current);
            }
        }
    }, []);

    useEffect(() => {
        urlRef.current = url;
        if (url) {
            const img = new Image();
            img.onload = () => {
                if (url === urlRef.current) {
                    setCurrentImage(img);
                }
            }
            img.onerror = () => {
                console.log("Loading image error");
                if (url === urlRef.current) {
                    setCurrentImage(null);
                }
            }
            img.src = url;
        } else {
            setCurrentImage(null);
        }
    }, [url]);

    // 画布或者图像变化时，重绘
    useEffect(() => {

        // 绘制方块背景色，每个方块边长为20px
        function drawBackground() {
            for (let i = 0; i < canvasWidth; i += 20) {
                for (let j = 0; j < canvasHeight; j += 20) {
                    let pos = Math.floor((i + j) / 20) % 2;
                    let color = bgColors[pos];
                    const context = canvasContext.current!;
                    context.fillStyle = color;
                    context.fillRect(i, j, 20, 20);
                    context.lineWidth = 1;
                    context.strokeStyle = "rgba(0,0,0,0.25)";
                    context.strokeRect(i, j, 20, 20);
                }
            }
        }

        // 居中绘制图像
        function drawImage() {
            if (currentImage) {
                const nativeWidth = currentImage.naturalWidth;
                const nativeHeight = currentImage.naturalHeight;
                const factorH = nativeWidth / canvasWidth;
                const factorV = nativeHeight / canvasHeight;
                let factor = 1;
                if (factorH > 1 || factorV > 1) {
                    factor = Math.max(factorH, factorV);
                }
                const renderWidth = Math.floor(nativeWidth / factor);
                const renderHeight = Math.floor(nativeHeight / factor);
                const imageLeft = Math.floor((canvasWidth - renderWidth) / 2);
                const imageTop = Math.floor((canvasHeight - renderHeight) / 2);
                const context = canvasContext.current!;
                context.drawImage(currentImage, imageLeft, imageTop, renderWidth, renderHeight);
                // 绘制裁剪框
                const { top, right, bottom, left, radius } = clipParams;
                if (right > left && bottom > top) {
                    const clipLeft = Math.floor(imageLeft + left / factor);
                    const clipTop = Math.floor(imageTop + top / factor);
                    const clipWidth = Math.floor((right - left) / factor);
                    const clipHeight = Math.floor((bottom - top) / factor);
                    context.lineWidth = 2;
                    context.strokeStyle = "rgba(255,0,0,0.8)";
                    drawRoundedRect({
                        x: clipLeft,
                        y: clipTop,
                        width: clipWidth,
                        height: clipHeight
                    }, Math.floor(radius / factor), context);
                }
            }

        }

        function draw() {
            if (canvasContext.current && canvasHeight && canvasWidth) {
                canvasContext.current.clearRect(0, 0, canvasWidth, canvasHeight);
                drawBackground();
                drawImage();
            }
        }

        draw();

    }, [currentImage, canvasHeight, canvasWidth, clipParams]);

    return <canvas className="h-full w-full" height={canvasHeight} width={canvasWidth} ref={canvasRef} />
}