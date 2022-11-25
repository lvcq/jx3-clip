import { Part } from "@data/part";
import { hairImagesAtom, panelWidthAtom } from "@store/project.store"
import { useAtom } from "jotai"
import { ImageWrapper } from "./image-wrapper";
import { WorktopGrid } from "./worktop-grid";
import { WorktopGridClothes } from "./worktop-grid-clothes";


export function Worktop<FC>() {
    const [panelWidth] = useAtom(panelWidthAtom);
    return <div className="h-full p-4 overflow-auto">
        <div style={{ width: `${panelWidth}px` }}>
            <WorktopGrid type={Part.HAIR} />
            <WorktopGridClothes type={Part.CLOTHES} />
        </div>
    </div>
}