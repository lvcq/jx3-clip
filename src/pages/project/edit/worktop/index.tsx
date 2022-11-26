import { Part } from "@data/part";
import { panelWidthAtom, scaleFactorAtom } from "@store/project.store"
import { useAtom } from "jotai"
import { useEffect, useState } from "preact/hooks";
import { WorktopGrid } from "./worktop-grid";
import { WorktopGridClothes } from "./worktop-grid-clothes";


export function Worktop<FC>() {
    const [panelWidth] = useAtom(panelWidthAtom);
    const [scale] = useAtom(scaleFactorAtom);
    const [renderWith, updateRenderWidth] = useState(() => Math.floor(panelWidth * scale / 100));

    useEffect(() => {
        updateRenderWidth(Math.floor(panelWidth * scale / 100));
    }, [panelWidth, scale]);

    return <div className="h-full p-4 overflow-auto">
        <div className="mx-auto" style={{ width: `${renderWith}px` }}>
            <WorktopGrid type={Part.HAIR} />
            <WorktopGridClothes type={Part.CLOTHES} />
        </div>
    </div>
}