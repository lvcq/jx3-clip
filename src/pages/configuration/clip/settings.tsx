import { UploadBtn } from "./upload-btn";
import { useAtom } from "jotai";
import { bodyType, clipBottomAtom, clipExampleImage, clipLeftAtom, clipRadiusAtom, clipRightAtom, clipTopAtom, partAtom } from "@store/clip-config.store"
import { DividerH } from "@components/divider-h";
import { SubTitle } from "@components/sub-title";
import { FormItem } from "@components/form-item";
import { bodyTypeRefs, getBodyType } from "@data/body-type";
import { JSX } from "preact";
import { getPart, partRefs } from "@data/part";
interface SettingsProps {

}
export function Settings<FC>({ }: SettingsProps) {
    const [exampleImageUrl, setExampleImageUrl] = useAtom(clipExampleImage);
    const [bt, btUpdate] = useAtom(bodyType);
    const [part, partUpdate] = useAtom(partAtom);
    const [top, updateTop] = useAtom(clipTopAtom);
    const [right, updateRight] = useAtom(clipRightAtom);
    const [bottom, updateBottom] = useAtom(clipBottomAtom);
    const [left, updateLeft] = useAtom(clipLeftAtom);
    const [radius, updateRadius] = useAtom(clipRadiusAtom);

    function handleImageChange(url: string) {
        setExampleImageUrl(url);
    }

    function handleBodyTypeChange(evt: JSX.TargetedEvent<HTMLSelectElement>) {
        const value = evt.currentTarget.value;
        const num = parseInt(value, 10);
        const type = getBodyType(num);
        if (type) {
            btUpdate(type)
        }
    }

    function handlePartChange(evt: JSX.TargetedEvent<HTMLSelectElement>) {
        const value = evt.currentTarget.value;
        const num = parseInt(value, 10);
        const part = getPart(num);
        if (part) {
            partUpdate(part);
        }
    }

    function parseStringToNumber(source: string): number {
        let num = parseInt(source, 10) || 0
        return num >= 0 ? num : 0;
    }

    function handleLeftChange(evt: JSX.TargetedEvent<HTMLInputElement>) {
        let num = parseStringToNumber(evt.currentTarget.value);
        updateLeft(num);
    }

    function handleTopChange(evt: JSX.TargetedEvent<HTMLInputElement>) {
        let num = parseStringToNumber(evt.currentTarget.value);
        updateTop(num);
    }

    function handleRightChange(evt: JSX.TargetedEvent<HTMLInputElement>) {
        let num = parseStringToNumber(evt.currentTarget.value);
        updateRight(num);
    }

    function handleBottomChange(evt: JSX.TargetedEvent<HTMLInputElement>) {
        let num = parseStringToNumber(evt.currentTarget.value);
        updateBottom(num);
    }

    function handleRadiusChange(evt: JSX.TargetedEvent<HTMLInputElement>) {
        let num = parseStringToNumber(evt.currentTarget.value);
        updateRadius(num);
    }

    return <div className="h-full p-3">
        <UploadBtn onChange={handleImageChange} />
        <DividerH />
        <SubTitle>分类设置</SubTitle>
        <FormItem label="体型">
            <select className="w-full" onChange={handleBodyTypeChange}>
                {
                    bodyTypeRefs.map((item) => <option key={item.key} value={item.key} checked={bt === item.key}>{item.label}</option>)
                }
            </select>
        </FormItem>
        <FormItem label="部位">
            <select className="w-full" onChange={handlePartChange}>
                {
                    partRefs.map(item => <option key={item.key} value={item.key} checked={part === item.key}>{item.label}</option>)
                }
            </select>
        </FormItem>
        <DividerH />
        <SubTitle>裁剪参数设置</SubTitle>
        <FormItem label="左侧">
            <input className="w-full p-1" value={left} type="number" onChange={handleLeftChange} />
        </FormItem>
        <FormItem label="顶部">
            <input className="w-full p-1" value={top} type="number" onChange={handleTopChange} />
        </FormItem>
        <FormItem label="右侧">
            <input className="w-full p-1" value={right} type="number" onChange={handleRightChange} />
        </FormItem>
        <FormItem label="底部">
            <input className="w-full p-1" value={bottom} type="numsber" onChange={handleBottomChange} />
        </FormItem>
        <FormItem label="圆角">
            <input className="w-full p-1" value={radius} type="number" onChange={handleRadiusChange} />
        </FormItem>
    </div>
}