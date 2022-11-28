import { FormItem } from "@components/form-item";
import { SubTitle } from "@components/sub-title";
import { centralVPaddingAtom } from "@store/project.store";
import { useAtom } from "jotai";

export function CenterRegionProperties<FC>(){
    const [vpadding,updatevPadding]=useAtom(centralVPaddingAtom);
    function parseStringToNumber(source: string): number {
        let num = parseInt(source, 10) || 0
        return num >= 0 ? num : 0;
    }
    function handleNumberChange(evt: JSX.TargetedEvent<HTMLInputElement, Event>, updater: (update: number) => void) {
        let num = parseStringToNumber(evt.currentTarget.value);
        updater(num);
    }
    return <>
        <SubTitle>中部区域设置</SubTitle>
        <FormItem label="垂直间距">
        <input className="w-full" type="number" value={vpadding} onChange={(evt) => handleNumberChange(evt, updatevPadding)}></input>
        </FormItem>
    </>
}