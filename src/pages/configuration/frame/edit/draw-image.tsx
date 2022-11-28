import { frameConfigAtom, frameDemoImageAtom, frameSourceAtom } from "@store/frame-config.store";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "preact/hooks";

interface DrawImageProps {

}

const bgColors = ["#333336", "#9a9999"]

export function DrawImage<FC>({ }: DrawImageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [source] = useAtom(frameSourceAtom);
    const [demo] = useAtom(frameDemoImageAtom)
    const monitor = useRef<number>(0);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);
    const canvasContext = useRef<CanvasRenderingContext2D | null>(null);
    const [frameImage, updateFrameImage] = useState<HTMLImageElement | null>(null);
    const [demoImage, updateDemoImage] = useState<HTMLImageElement | null>(null);
    const [frameConfig] = useAtom(frameConfigAtom);
    const [frameSize, updateFrameSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        async function createSourceUrl() {
            if (source) {
                const image = await readBinaryFile(source as string);
                const imageBlob = new Blob([image]);
                const url = window.URL.createObjectURL(imageBlob);
                let img = new Image();
                img.onload = () => {
                    updateFrameImage(img);
                    updateFrameSize({
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    })
                };
                img.src = url;
            } else {
                updateFrameImage(null)
            }
        }
        createSourceUrl();
    }, [source]);

    useEffect(() => {
        async function createSourceUrl() {
            if (demo) {
                const image = await readBinaryFile(demo as string);
                const imageBlob = new Blob([image]);
                const url = window.URL.createObjectURL(imageBlob);
                let img = new Image();
                img.onload = () => {
                    updateDemoImage(img);
                };
                img.src = url;
            } else {
                updateDemoImage(null)
            }
        }
        createSourceUrl();
    }, [demo])


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
            let {left,right,top,bottom} = frameConfig;
            if (frameImage && demoImage && right>left && bottom>top) {
                const demoNativeWidth = demoImage.naturalWidth;
                const demoNativeHeight = demoImage.naturalHeight;
                const frameNativeWidth = frameImage.naturalWidth;
                const frameNativeHeight = frameImage.naturalHeight;
                const hFactor = (demoNativeWidth / (right-left));
                const vFactor = (demoNativeHeight/(bottom-top));
                const frameRenderWidth = Math.floor(hFactor* frameNativeWidth);
                const frameRenderHeight = Math.floor(vFactor * frameNativeHeight);
                const offsetLeft = Math.floor(left*hFactor);
                const offsetTop = Math.floor(top*vFactor);
                const context = canvasContext.current!;

                // draw demo
                const demoImageLeft = Math.floor((canvasWidth - demoNativeWidth) / 2);
                const demoImageTop = Math.floor((canvasHeight - demoNativeHeight) / 2);
                context.drawImage(demoImage, demoImageLeft, demoImageTop, demoNativeWidth, demoNativeHeight);

                // draw frame
                const imageLeft = demoImageLeft-offsetLeft;
                const imageTop = demoImageTop-offsetTop;

                console.log(frameRenderHeight, frameRenderWidth);
                context.drawImage(frameImage, imageLeft, imageTop, frameRenderWidth, frameRenderHeight);

            } else {
                if (frameImage) {
                    const nativeWidth = frameImage.naturalWidth;
                    const nativeHeight = frameImage.naturalHeight;
                    const imageLeft = Math.floor((canvasWidth - nativeWidth) / 2);
                    const imageTop = Math.floor((canvasHeight - nativeHeight) / 2);
                    const context = canvasContext.current!;
                    context.drawImage(frameImage, imageLeft, imageTop, nativeWidth, nativeHeight);
                }
                if (demoImage) {
                    const nativeWidth = demoImage.naturalWidth;
                    const nativeHeight = demoImage.naturalHeight;
                    const imageLeft = Math.floor((canvasWidth - nativeWidth) / 2);
                    const imageTop = Math.floor((canvasHeight - nativeHeight) / 2);
                    const context = canvasContext.current!;
                    context.drawImage(demoImage, imageLeft, imageTop, nativeWidth, nativeHeight);
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

    }, [frameImage, demoImage, canvasHeight, canvasWidth, frameConfig.top, frameConfig.right,frameConfig.bottom,frameConfig.left]);

    return <div className="h-full w-full relative">
        <canvas className="h-full w-full" height={canvasHeight} width={canvasWidth} ref={canvasRef} />
        <div className="absolute right-0 bottom-0 p-4 bg-white shadow-lg">
            <span>边框尺寸: {frameSize.width} x {frameSize.height}</span>
        </div>
    </div>
}