import { DividerH } from "@components/divider-h";
import { FormItem } from "@components/form-item";
import { getPart, partRefs } from "@data/part";
import { modalConfigAtom } from "@store/modal.store";
import { filteredClipConfigAtom, selectedClipConfigAtom, selectedPartAtom } from "@store/project.store";
import { open } from "@tauri-apps/api/dialog";
import { useAtom } from "jotai";
import { JSX } from "preact";
import { useState } from "preact/hooks";


export function Properties<FC>() {
    const [, updateModal] = useAtom(modalConfigAtom);
    const [part, updatePart] = useAtom(selectedPartAtom);
    const [config, updateConfig] = useAtom(selectedClipConfigAtom);
    const [configList] = useAtom(filteredClipConfigAtom);
    const [imageList, updateImageList] = useState<Array<string>>([]);

    function handlePartChange(evt: JSX.TargetedEvent<HTMLSelectElement>) {
        const value = evt.currentTarget.value;
        const num = parseInt(value, 10);
        const part = getPart(num);
        if (part) {
            updatePart(part);
        }
    }

    function handleConfigChange(evt: JSX.TargetedEvent<HTMLSelectElement>) {
        const value = evt.currentTarget.value;
        const num = parseInt(value, 10);
        let selected = configList.find(item => item.id === num);
        updateConfig(selected)
    }

    async function handleSelectImageClick() {
        const paths = await open({
            multiple: true,
            filters: [{
                name: "图像",
                extensions: ["png", "jpeg", "jpg"]
            }]
        });
        if (paths) {
            if (typeof paths === "string") {
                updateImageList([paths]);
            } else {
                updateImageList(paths);
            }

        }

    }


    function handleImportClick() {
        updateModal({
            visiable: true,
            title: "导入图片",
            content: <div className="w-96">
                <FormItem label="部位">
                    <select className="w-full" onChange={handlePartChange}>
                        {
                            partRefs.map(item => <option key={item.key} value={item.key} selected={part === item.key}>{item.label}</option>)
                        }
                    </select>
                </FormItem>
                <FormItem label="配置">
                    <select className="w-full" onChange={handleConfigChange}>
                        {
                            configList.map(item => <option key={item.id} value={item.id} selected={config && (config.id === item.id)}>{item.name}</option>)
                        }
                    </select>
                </FormItem>
                <FormItem label="图片">
                    <button className="py-px px-2 mr-2 bg-primary text-white" onClick={handleSelectImageClick}>选择</button>
                </FormItem>
            </div>
        })
    }

    return <div className="h-full overflow-y-auto">
        <button className="text-lg block w-4/5 h-9 leading-9 rounded m-auto mb-4 text-white bg-primary" onClick={handleImportClick}>导入图片</button>
        <DividerH />
    </div>
} 