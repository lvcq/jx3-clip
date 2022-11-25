import { hairConfigAtom, hairImagesAtom } from "@store/project.store"
import { useAtom } from "jotai"
import { useEffect, useState } from "preact/hooks";
import { ImageWrapper } from "./image-wrapper";

interface WorktopGridProps {
    type?: number;
}

export function WorktopGrid<FC>({ type }: WorktopGridProps) {
    const [config] = useAtom(hairConfigAtom);
    const [,updateImages]=useAtom(hairImagesAtom);
    const [gridStyle, updateGridStyle] = useState<{ [key: string]: string; }>({});
    useEffect(() => {
        updateGridStyle({
            "grid-template-columns": `repeat(${config.cols},1fr)`,
            "grid-column-gap": `${config.colgap}px`,
            "grid-row-gap": `${config.rowgap}px`,
        });
    }, [config.rowgap, config.colgap, config.cols]);

    function handleImageMove(source: string, target: string) {
        let sourceIndex = config.images.findIndex(item => item.key === source);
        let targetIndex = config.images.findIndex(item => item.key === target);
        let newList = [...config.images];
        let souceItem = newList.find(item => item.key === source)!;
        newList.splice(sourceIndex, 1);
        newList.splice(targetIndex, 0, souceItem);
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