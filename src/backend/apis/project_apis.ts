import { ProjectBrief, ProjectConfig, ProjectDetail } from "@backend/model";
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

export async function create_preview_api(config: ProjectConfig) {
    try {
        console.log(config);
        return await invoke<string>("create_preview_img_api", {
            config
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export async function export_image(source: string, target: string, format: string) {
    try {
        await invoke("export_project_image", {
            source,
            target,
            format
        })
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export async function save_project_api(detail: ProjectDetail,cover:boolean) {
    try {
        await invoke("save_project_api", {
            detail,
            cover
        })
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export async function get_all_project_api(): Promise<Array<ProjectBrief>> {
    try {
        let list = await invoke<ProjectBrief[]>("get_all_projects_api");
        return list;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export async function load_project_api(path:string):Promise<ProjectConfig>{
    try {
        let config = await invoke<ProjectConfig>("load_project_api",{path});
        return config;
    } catch (err) {
        console.log(err);
        throw err;
    }
}