import { FormItem } from "@components/form-item";
import { SubTitle } from "@components/sub-title";
import { frameConfigListAtom } from "@store/frame-config.store";
import {
    clothesColgapAtom,
    clothesColsAtom,
    clothesFrameConfigAtom,
    clothesImagesAtom,
    clothesRowgapAtom,
} from "@store/project.store";
import { getDivisor } from "@utils/math-helper";
import { useAtom } from "jotai";
import { TargetedEvent } from "preact/compat";


export function ClothesPOroperties<FC>() {
    const [rowgap, updateRowgap] = useAtom(clothesRowgapAtom);
    const [colgap, updateColgap] = useAtom(clothesColgapAtom);
    const [cols, updateCols] = useAtom(clothesColsAtom);
    const [images] = useAtom(clothesImagesAtom);
    const [frame, updateFrame] = useAtom(clothesFrameConfigAtom);
    const [frameList] = useAtom(frameConfigListAtom);

    function parseStringToNumber(source: string): number {
        let num = parseInt(source, 10) || 0
        return num >= 0 ? num : 0;
    }

    function handleNumberChange(evt: JSX.TargetedEvent<HTMLInputElement, Event>, updater: (update: number) => void) {
        let num = parseStringToNumber(evt.currentTarget.value);
        updater(num);
    }

    function handleFramgeChange(event: TargetedEvent<HTMLSelectElement>) {
        const value = event.currentTarget.value;
        let item = frameList.find(item => String(item.id) === value);
        if (item) {
            updateFrame(item);
        } else {
            updateFrame(undefined);
        }
    }


    return <>
        <SubTitle>全身设置</SubTitle>
        <FormItem label="边框">
            <select className="w-full" onChange={handleFramgeChange}>
                <option value={undefined} checked={frame === undefined}>无边框</option>
                {frameList.map(item => (<option key={item?.id} value={item?.id} checked={frame && (frame.id === item.id)}>{item.name}</option>))}
            </select>
        </FormItem>
        <FormItem label="行间距">
            <input className="w-full" type="number" value={rowgap} onChange={(evt) => handleNumberChange(evt, updateRowgap)}></input>
        </FormItem>
        <FormItem label="列间距">
            <input className="w-full" type="number" value={colgap} onChange={(evt) => handleNumberChange(evt, updateColgap)}></input>
        </FormItem>
        <FormItem label="列数">
            <input className="w-full" type="number" min={1} value={cols} onChange={(evt) => handleNumberChange(evt, updateCols)}></input>
        </FormItem>
        <FormItem>
            <div className="pl-8 text-gray-400 text-sm">
                <span >共有{cols > 0 ? Math.floor(images.length / cols) : "--"}行, 剩余{cols > 0 ? images.length % cols : "--"}张。</span><br/>
                <span >可选列数:{images.length>0?getDivisor(images.length).join(", "):"--"}</span>
            </div>
        </FormItem>
    </>
}