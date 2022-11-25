import { DividerH } from "@components/divider-h";
import { FormItem } from "@components/form-item";
import { Modal } from "@components/global-modal";
import { allClipConfigAtom } from "@store/clip-config.store";
import {
    clothesHeightAtom,
    clothesImagesAtom,
    clothesWidthAtom,
    hairHeightAtom,
    hairImagesAtom,
    hairWithAtom,
    selectedClipConfigAtom,
    projectCacheAtom
} from "@store/project.store";
import { open } from "@tauri-apps/api/dialog";
import { clipImageTasks } from "@utils/clip";
import { useAtom } from "jotai";
import { JSX } from "preact";
import { useState } from "preact/hooks";
import { HairPOroperties } from "./hair-properties";
import forge from "node-forge";
import { ClothesPOroperties } from "./clothes-properties";
import { Part } from "@data/part";
import { PreView } from "../preview";
import { homeDir } from '@tauri-apps/api/path';
import { getPreDirFormPath } from "@utils/fileopt";


export function Properties<FC>() {
    const [config, updateConfig] = useAtom(selectedClipConfigAtom);
    const [configList] = useAtom(allClipConfigAtom);
    const [imageList, updateImageList] = useState<Array<string>>([]);
    const [hairImages, updateHairImages] = useAtom(hairImagesAtom);
    const [clothesImages, updateClothesImages] = useAtom(clothesImagesAtom);
    const [, updateHairWidth] = useAtom(hairWithAtom);
    const [, updateClothesWidth] = useAtom(clothesWidthAtom);
    const [, updateHairHeight] = useAtom(hairHeightAtom);
    const [, updateClothesHeight] = useAtom(clothesHeightAtom);
    const [selectImageVisible, updateSelectImageVisible] = useState<boolean>(false);
    const [showPreview, updateShowPreview] = useState(false);
    const [projectCache, updateProjectCache] = useAtom(projectCacheAtom);


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
            }],
            defaultPath: projectCache.savePreDir || await homeDir()
        });
        if (paths) {
            let path = ""
            if (typeof paths === "string") {
                path = paths;
                updateImageList([paths]);
            } else {
                path = paths[0];
                updateImageList(paths);
            }
            let savePreDir = getPreDirFormPath(path);
            updateProjectCache((preData: any) => {
                return {
                    ...preData,
                    savePreDir
                }
            });
        }
    }

    function handleImageSelectClose() {
        updateImageList([]);
        updateSelectImageVisible(false);
    }

    async function handleImageSelectOk() {
        if (imageList.length > 0 && config) {
            let { top, right, bottom, left, radius } = config;
            let list = await clipImageTasks(imageList, top, right, bottom, left, radius);
            let sha256 = forge.md.sha256.create();
            let result = list.map(img => {
                return {
                    url: img,
                    key: sha256.update(img).digest().toHex()
                }
            })
            if (config.part === Part.HAIR) {
                updateHairImages([...hairImages, ...result]);
                updateHairWidth(right - left);
                updateHairHeight(bottom - top);
            } else {
                updateClothesImages([...clothesImages, ...result]);
                updateClothesWidth(right - left);
                updateClothesHeight(bottom - top);
            }

        }
        updateImageList([]);
        updateSelectImageVisible(false);
    }

    function handleImportClick() {
        updateImageList([]);
        if (configList.length) {
            let first = configList[0];
            updateConfig(first);
        }
        updateSelectImageVisible(true);
    }

    function handlePreview() {
        updateShowPreview(true);
    }

    return <div className="h-full overflow-y-auto flex flex-col">
        <button
            className="text-lg block w-4/5 h-9 leading-9 rounded m-auto mb-4 text-white bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleImportClick}
            disabled={!configList.length}
        >导入图片</button>
        <DividerH />
        <HairPOroperties />
        <DividerH />
        <ClothesPOroperties />
        <div className="flex-1"></div>
        <DividerH />
        <div className="px-2 py-1 text-right">
            <button className="py-px px-2 rounded bg-primary text-white hover:ring-2 ring-primary" onClick={handlePreview}>预览</button>
        </div>
        <Modal
            visible={selectImageVisible}
            title="导入图片"
            onClose={handleImageSelectClose}
            onOk={handleImageSelectOk}>
            <div className="w-96">
                <FormItem label="配置">
                    <select className="w-full" onChange={handleConfigChange} placeholder="请选择">
                        {
                            configList.map(item => <option key={item.id} value={item.id} selected={config && (config.id === item.id)}>{item.name}</option>)
                        }
                    </select>
                </FormItem>
                <FormItem label="图片">
                    <button className="py-px px-2 mr-2 rounded bg-primary text-white" onClick={handleSelectImageClick}>选择</button> <span>已选择 {imageList.length} 张图片 </span>
                </FormItem>
            </div>
        </Modal>
        <PreView open={showPreview} onClose={() => updateShowPreview(false)} />
    </div>
} 