import { FormItem } from "@components/form-item";
import { SubTitle } from "@components/sub-title";
import { hairColgapAtom, hairColsAtom, hairImagesAtom, hairRowgapAtom } from "@store/project.store";
import { useAtom } from "jotai";


export function HairPOroperties<FC>() {
    const [rowgap, updateRowgap] = useAtom(hairRowgapAtom);
    const [colgap, updateColgap] = useAtom(hairColgapAtom);
    const [cols, updateCols] = useAtom(hairColsAtom);
    const [images] = useAtom(hairImagesAtom);

    function parseStringToNumber(source: string): number {
        let num = parseInt(source, 10) || 0
        return num >= 0 ? num : 0;
    }
    function handleNumberChange(evt: JSX.TargetedEvent<HTMLInputElement, Event>, updater: (update: number) => void) {
        let num = parseStringToNumber(evt.currentTarget.value);
        updater(num);
    }
    return <>
        <SubTitle>头发设置</SubTitle>
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
            <span className="pl-8 text-gray-400 text-sm">共有{cols > 0 ? Math.floor(images.length / cols) : "--"}行, 剩余{images.length % cols}张。</span>
        </FormItem>
    </>
}