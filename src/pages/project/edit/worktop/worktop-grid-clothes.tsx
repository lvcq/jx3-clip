import { Part } from "@data/part";
import { clothesConfigAtom, clothesImagesAtom, ImageItem, selectionAtom } from "@store/project.store"
import { useAtom } from "jotai"
import { useEffect, useState } from "preact/hooks";
import { ImageWrapper } from "./image-wrapper";

interface WorktopGridProps {
    type?: number;
}

export function WorktopGridClothes<FC>({ type }: WorktopGridProps) {
    const [config] = useAtom(clothesConfigAtom);
    const [, updateImages] = useAtom(clothesImagesAtom);
    const [selection] = useAtom(selectionAtom);
    const [gridStyle, updateGridStyle] = useState<{ [key: string]: string; }>({});
    useEffect(() => {
        updateGridStyle({
            "grid-template-columns": `repeat(${config.cols},1fr)`,
            "grid-column-gap": `${config.colgap}px`,
            "grid-row-gap": `${config.rowgap}px`,
        });
    }, [config.rowgap, config.colgap, config.cols]);

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
        let newList =[...before,...selected,...after];
        updateImages(newList);
    }

    return <div className="grid" style={gridStyle}>
        {
            config.images.map(item => {
                return <ImageWrapper url={item.url} key={item.key} id={item.key} type={type} onMove={handleImageMove} />
            })
        }
    </div>
}