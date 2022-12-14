import { UploadBtn } from "./upload-btn";
import { useAtom } from "jotai";

import { DividerH } from "@components/divider-h";
import { SubTitle } from "@components/sub-title";
import { FormItem } from "@components/form-item";

import { JSX } from "preact";

import { globalNoticeAtom } from "@store/message.store";
import {
    frameBottomAtom,
    frameConfigListAtom,
    frameDemoImageAtom,
    frameIdAtom,
    frameLeftAtom,
    frameNameAtom,
    frameRightAtom,
    frameSourceAtom,
    frameTopAtom
} from "@store/frame-config.store";
import { create_frame_config, get_all_frame_config, update_frame_config } from "@backend/apis/frame_config";
interface SettingsProps {

}
export function Settings<FC>({ }: SettingsProps) {
    const [source, updateSource] = useAtom(frameSourceAtom);
    const [, updateDemo] = useAtom(frameDemoImageAtom);
    const [configName, updateConfigName] = useAtom(frameNameAtom);
    const [, updateMessage] = useAtom(globalNoticeAtom);
    const [, updateClipList] = useAtom(frameConfigListAtom);
    const [top, updateTop] = useAtom(frameTopAtom);
    const [right, updateRight] = useAtom(frameRightAtom);
    const [bottom, updateBottom] = useAtom(frameBottomAtom);
    const [left, updateLeft] = useAtom(frameLeftAtom);
    const [configId, updateConfigId] = useAtom(frameIdAtom);

    function handleImageChange(source: string) {
        updateSource(source);
    }


    function handleDemoImageChange(source: string) {
        updateDemo(source);
    }


    function parseStringToNumber(source: string): number {
        let num = parseInt(source, 10) || 0
        return num >= 0 ? num : 0;
    }
    function handleNumberChange(evt: JSX.TargetedEvent<HTMLInputElement, Event>, updater: (update: number) => void) {
        let num = parseStringToNumber(evt.currentTarget.value);
        updater(num);
    }


    async function handleSave() {
        try {
            if (!configName.trim()) {
                return;
            }
            if (!source) {
                return;
            }
            if (configId === undefined) {
                await handle_create_frame_config();
            } else {
                await handle_update_frame_config();
            }

            const list = await get_all_frame_config();
            updateClipList(list);
            updateMessage({
                type: 'success',
                message: "??????????????????"
            })
        } catch (err) {
            console.log(err);
            updateMessage({
                type: 'error',
                message: "??????????????????"
            })
        }
    }

    async function handle_create_frame_config() {
        return await create_frame_config({
            name: configName,
            top,
            right,
            bottom,
            left,
            source
        });
    }

    async function handle_update_frame_config() {
        return await update_frame_config({
            id: configId as number,
            name: configName,
            top,
            right,
            bottom,
            left,
            source
        })
    }

    function handleGoBack() {
        history.back();
    }

    return <div className="h-full p-3 flex flex-col overflow-y-auto">
        <UploadBtn onChange={handleImageChange} >????????????</UploadBtn>
        <UploadBtn className="mt-1" onChange={handleDemoImageChange}>??????????????????</UploadBtn>
        <DividerH />

        <SubTitle>??????????????????</SubTitle>
        <FormItem label="??????">
            <input className="w-full p-1" value={left} type="number" onChange={(event) => handleNumberChange(event, updateLeft)} />
        </FormItem>
        <FormItem label="??????">
            <input className="w-full p-1" value={top} type="number" onChange={(event) => handleNumberChange(event, updateTop)} />
        </FormItem>
        <FormItem label="??????">
            <input className="w-full p-1" value={right} type="number" onChange={(event) => handleNumberChange(event, updateRight)} />
        </FormItem>
        <FormItem label="??????">
            <input className="w-full p-1" value={bottom} type="number" onChange={(event) => handleNumberChange(event, updateBottom)} />
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