
import { FormItem } from "@components/form-item";
import { SubTitle } from "@components/sub-title";
import { scaleFactorAtom } from "@store/project.store";
import { useAtom } from "jotai";
import { TargetedEvent } from "preact/compat";


export function CommonProperties<FC>() {
    const [scale, updateScale] = useAtom(scaleFactorAtom);

    function parseStringToNumber(source: string): number {
        let num = parseInt(source, 10) || 0
        return num >= 0 ? num : 0;
    }

    function handleScaleChange(evt: TargetedEvent<HTMLInputElement>) {
        let num = parseStringToNumber(evt.currentTarget.value);
        updateScale(num)
    }
    return <>
        <SubTitle>基础设置</SubTitle>
        <FormItem label="缩放">
            <div className="pr-16 relative">
                <input className="w-full" type="range" value={scale} min={0} max={100} onChange={handleScaleChange} />
                <div className="absolute top-0 right-0 w-16 text-center">{scale}</div>
            </div>
        </FormItem>
    </>
}