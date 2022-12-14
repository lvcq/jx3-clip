import { UploadBtn } from "./upload-btn";
import { useAtom } from "jotai";
import {
    allClipConfigAtom,
    bodyType,
    clipBottomAtom,
    clipLeftAtom,
    clipRadiusAtom,
    clipRightAtom,
    clipTopAtom,
    configIdAtom,
    configNameAtom,
    partAtom,
    SourceAtom
} from "@store/clip-config.store"
import { DividerH } from "@components/divider-h";
import { SubTitle } from "@components/sub-title";
import { FormItem } from "@components/form-item";
import { bodyTypeRefs, getBodyType } from "@data/body-type";
import { JSX } from "preact";
import { getPart, partRefs } from "@data/part";
import { create_clip_config, get_all_clip_config, update_clip_config } from "@apis/clip_config";
import { globalNoticeAtom } from "@store/message.store";
interface SettingsProps {

}
export function Settings<FC>({ }: SettingsProps) {
    const [source, updateSource] = useAtom(SourceAtom);
    const [configName, updateConfigName] = useAtom(configNameAtom);
    const [bt, btUpdate] = useAtom(bodyType);
    const [part, partUpdate] = useAtom(partAtom);
    const [top, updateTop] = useAtom(clipTopAtom);
    const [right, updateRight] = useAtom(clipRightAtom);
    const [bottom, updateBottom] = useAtom(clipBottomAtom);
    const [left, updateLeft] = useAtom(clipLeftAtom);
    const [radius, updateRadius] = useAtom(clipRadiusAtom);
    const [, updateMessage] = useAtom(globalNoticeAtom);
    const [, updateClipList] = useAtom(allClipConfigAtom);
    const [configId,updateConfigId] = useAtom(configIdAtom);

    function handleImageChange(source: string) {
        updateSource(source);
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

    async function handleSave() {
        try {
            if (!configName.trim()) {
                return;
            }
            if (!source) {
                return;
            }
            if(configId===null){
                await handle_create_clip_config();
            }else{
                await handle_update_clip_config();
            }

            const list = await get_all_clip_config();
            updateClipList(list);
            updateMessage({
                type: 'success',
                message: "????????????????????????"
            })
        } catch (err) {
            console.log(err);
            updateMessage({
                type: 'error',
                message: "????????????????????????"
            })
        }
    }

    async function handle_create_clip_config() {
       return await create_clip_config({
            name: configName,
            body_type: bt,
            part: part,
            top,
            right,
            bottom,
            left,
            radius,
            source
        });
    }

    async function handle_update_clip_config() {
        return await update_clip_config({
            id:configId as number,
            name: configName,
            body_type: bt,
            part: part,
            top,
            right,
            bottom,
            left,
            radius,
            source
        })
    }

    function handleGoBack() {
        history.back();
    }

    return <div className="h-full p-3 flex flex-col overflow-y-auto">
        <UploadBtn onChange={handleImageChange} />
        <DividerH />
        <SubTitle>????????????</SubTitle>
        <FormItem label="??????">
            <select className="w-full" onChange={handleBodyTypeChange}>
                {
                    bodyTypeRefs.map((item) => <option key={item.key} value={item.key} selected={bt === item.key}>{item.label}</option>)
                }
            </select>
        </FormItem>
        <FormItem label="??????">
            <select className="w-full" onChange={handlePartChange}>
                {
                    partRefs.map(item => <option key={item.key} value={item.key} selected={part === item.key}>{item.label}</option>)
                }
            </select>
        </FormItem>
        <DividerH />
        <SubTitle>??????????????????</SubTitle>
        <FormItem label="??????">
            <input className="w-full p-1" value={left} type="number" onChange={handleLeftChange} />
        </FormItem>
        <FormItem label="??????">
            <input className="w-full p-1" value={top} type="number" onChange={handleTopChange} />
        </FormItem>
        <FormItem label="??????">
            <input className="w-full p-1" value={right} type="number" onChange={handleRightChange} />
        </FormItem>
        <FormItem label="??????">
            <input className="w-full p-1" value={bottom} type="numsber" onChange={handleBottomChange} />
        </FormItem>
        <FormItem label="??????">
            <input className="w-full p-1" value={radius} type="number" onChange={handleRadiusChange} />
        </FormItem>
        <DividerH />
        <SubTitle>????????????</SubTitle>
        <FormItem label="??????">
            <input className="w-full p-1" value={configName} onChange={(evt) => {
                const value = evt.currentTarget.value;
                updateConfigName(value);
            }} />
        </FormItem>
        <div className="flex-1">
        </div>
        <DividerH />
        <div className="p-3 text-right">
            <button onClick={handleGoBack} className="px-2 py-px rounded bg-primary text-white hover:ring-2 ring-blue-300">??????</button>
            <button onClick={handleSave} className="ml-2 px-2 py-px rounded bg-primary text-white hover:ring-2 ring-blue-300">??????</button>
        </div>
    </div>
}