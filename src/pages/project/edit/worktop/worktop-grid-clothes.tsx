import { Part } from "@data/part";
import { clearSelectionAtom, clothesConfigAtom, clothesFrameConfigAtom, clothesImagesAtom, ImageItem, panelWidthAtom, scaleFactorAtom, selectionAtom } from "@store/project.store"
import { loadLocalImage } from "@utils/fileopt";
import { useAtom } from "jotai"
import { TargetedEvent } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { ImageWrapper } from "./image-wrapper";

interface WorktopGridProps {
    type?: number;
}

export function WorktopGridClothes<FC>({ type }: WorktopGridProps) {
    const [config] = useAtom(clothesConfigAtom);
    const [, updateImages] = useAtom(clothesImagesAtom);
    const [panelWidth] = useAtom(panelWidthAtom);
    const [selection] = useAtom(selectionAtom);
    const [gridStyle, updateGridStyle] = useState<{ [key: string]: string; }>({});
    const [, clearSelection] = useAtom(clearSelectionAtom);
    const [scale] = useAtom(scaleFactorAtom);
    const [frameConfig] = useAtom(clothesFrameConfigAtom);
    const [frameUrl, updateFrameUrl] = useState<string | null>(null);
    const [imgPadding, updateImagePadding] = useState({
        pt: 0,
        pr: 0,
        pb: 0,
        pl: 0
    });
    const [imagePStyle, updateImagePStyle] = useState<string | JSX.CSSProperties | JSX.SignalLike<string | JSX.CSSProperties>>({});

    useEffect(() => {
        async function loadFrameImage() {
            try {
                if (frameConfig) {
                    const url = await loadLocalImage(frameConfig.source);
                    const { width, height, top, right, bottom, left } = frameConfig;
                    let innerWidth = right - left;
                    let innerHeight = bottom - top;
                    let hFactor = config.width / innerWidth;
                    let vFactor = config.height / innerHeight;
                    let pt = Math.floor(top * vFactor);
                    let pr = Math.floor((width! - right) * hFactor);
                    let pb = Math.floor((height! - bottom) * vFactor);
                    let pl = Math.floor(left * hFactor);
                    updateFrameUrl(url);
                    updateImagePadding({
                        pt,
                        pr,
                        pb,
                        pl
                    })
                } else {
                    updateFrameUrl(null);
                    updateImagePStyle({});
                }
            } catch (err) {
                console.log(err);
                updateFrameUrl(null);
                updateImagePStyle({});
            }

        }
        loadFrameImage();
    }, [frameConfig]);

    useEffect(() => {
        const { pt, pr, pb, pl } = imgPadding;
        const factor = panelWidth.clothesFactor;
        updateImagePStyle({
            paddingTop: `${Math.floor(pt * scale * factor / 100)}px`,
            paddingRight: `${Math.floor(pr * scale * factor / 100)}px`,
            paddingBottom: `${Math.floor(pb * scale * factor / 100)}px`,
            paddingLeft: `${Math.floor(pl * scale * factor / 100)}px`,
        })
    }, [imgPadding, scale, panelWidth.clothesFactor]);

    useEffect(() => {
        updateGridStyle({
            "grid-template-columns": `repeat(${config.cols},1fr)`,
            "grid-column-gap": `${Math.floor(config.colgap * scale / 100)}px`,
            "grid-row-gap": `${Math.floor(config.rowgap * scale / 100)}px`,
        });
    }, [config.rowgap, config.colgap, config.cols, scale]);

    function handleImageMove(source: string, target: string) {
        let sources = [source];
        if (selection.part === Part.CLOTHES) {
            if (selection.list.includes(source)) {
                sources = selection.list;
            } else {
                sources.push(...selection.list);
            }
        }
        const before: ImageItem[] = [];
        const after: ImageItem[] = [];
        const selected: ImageItem[] = [];
        const len = config.images.length;
        let targetIndex = config.images.findIndex(item => item.key === target);
        for (let i = 0; i < len; i++) {
            let item = config.images[i]
            if (sources.includes(item.key)) {
                selected.push(item);
            } else if (i < targetIndex) {
                before.push(item);
            } else {
                after.push(item);
            }
        }
        let newList = [...before, ...selected, ...after];
        updateImages(newList);
    }

    function handleEmptyClick(event: TargetedEvent<HTMLDivElement, MouseEvent>) {
        event.stopPropagation();
        clearSelection();
    }

    function handleDeleteItem(key: string) {
        let deleteKeys = [key];
        if (selection.part === Part.CLOTHES) {
            deleteKeys.push(...selection.list);
        }
        let remainItems = config.images.filter(item => !deleteKeys.includes(item.key));
        updateImages(remainItems);
        clearSelection();
    }

    return <div className="grid" style={gridStyle} onClick={handleEmptyClick}>
        {
            config.images.map(item => {
                return <ImageWrapper
                    url={item.url}
                    frameUrl={frameUrl}
                    imgStyle={imagePStyle}
                    key={item.key}
                    id={item.key}
                    type={type}
                    onMove={handleImageMove}
                    onDelete={handleDeleteItem} />
            })
        }
    </div>
}