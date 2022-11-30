import { Part } from "@data/part";
import { clearSelectionAtom, panelWidthAtom, scaleFactorDeltaAtom } from "@store/project.store"
import { useAtom } from "jotai"
import { TargetedEvent } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { CentralRegion } from "./central-region";
import { WorktopGrid } from "./worktop-grid";
import { WorktopGridClothes } from "./worktop-grid-clothes";


export function Worktop<FC>() {
    const [panelWidth] = useAtom(panelWidthAtom);
    const [scale, updateScale] = useAtom(scaleFactorDeltaAtom);
    const [renderWith, updateRenderWidth] = useState(() => Math.floor(panelWidth.with * scale / 100));
    const [, clearSelection] = useAtom(clearSelectionAtom);

    useEffect(() => {
        updateRenderWidth(Math.floor(panelWidth.with * scale / 100));
    }, [panelWidth, scale]);


    function handleCanvasScale(event: TargetedEvent<HTMLDivElement, WheelEvent>) {
        // 使用 `ctrl`+滚轮缩放图片
        if (event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            if (event.deltaY > 0) {
                updateScale(1);
            } else {
                updateScale(-1);
            }
        }
    }

    function handleEmptyClick(event: TargetedEvent<HTMLDivElement, MouseEvent>) {
        event.stopPropagation();
        clearSelection();
    }

    return <div className="h-full p-4 overflow-auto" onWheel={handleCanvasScale} onClick={handleEmptyClick}>
        <div className="mx-auto" style={{ width: `${renderWith}px` }}>
            <WorktopGrid type={Part.HAIR} />
            <CentralRegion />
            <WorktopGridClothes type={Part.CLOTHES} />
        </div>
    </div>
}