import { invoke } from "@tauri-apps/api";

export async function clip_images_api(
    sources: Array<string>,
    top: number,
    right: number,
    bottom: number,
    left: number,
    radius: number): Promise<Array<string>> {
    try {
        const imagePaths = await invoke<Array<string>>("clip_img_api", {
            sources,
            top,
            right,
            bottom,
            left,
            radius
        });
        return imagePaths;
    } catch (err) {
        throw err;
    }
}

export interface FrameConfig {
    source: string;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface PartConfig {
    images: Array<string>;
    width: number;
    height: number;
    colgap: number;
    rowgap: number;
    cols: number;
    frame_config?: FrameConfig
}

export interface ProjectConfig {
    hair?: PartConfig;
    clothes?: PartConfig;
}

export async function create_preview_api(config:ProjectConfig){
    try{
        return await invoke<string>("create_preview_img_api",{
            config
        });
    }catch (err){
        console.log(err);
        throw err;
    }
}

export async function export_image(source:string,target:string,format:string){
    try{
         await invoke("export_project_image",{
            source,
            target,
            format
         })
    }catch (err){
        console.log(err);
        throw err;
    }
}