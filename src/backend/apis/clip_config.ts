import { BodyType } from "@data/body-type";
import { Part } from "@data/part";
import { invoke } from "@tauri-apps/api";

export interface ClipConfig {
    id?: number;
    name: string;
    body_type: BodyType;
    part: Part;
    top: number;
    right: number;
    bottom: number;
    left: number;
    radius: number;
    source?: string;
    thumbnail?: Array<number>;
    create_at?: number;
}
type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * 调用新建裁剪参数API
 */
export async function create_clip_config(params: ClipConfig) {
    return await invoke("create_clip_config", {
        name: params.name,
        bodyType: params.body_type,
        part: params.part,
        top: params.top,
        right: params.right,
        bottom: params.bottom,
        left: params.left,
        radius: params.radius,
        source: params.source
    })
}

/**
 * 获取所有配置
 */
export async function get_all_clip_config() {
    return await invoke<Array<ClipConfig>>("get_all_clip_config")
}

/**
 * 根据ID删除配置
 */
export async function delete_clip_config(id: string | number) {
    try {
        await invoke<boolean>("delete_clip_config", { id });
        return true;
    } catch {
        return false;
    }
}

/**
 * 根据ID获取裁剪数据详情
 */

export async function get_clip_config_detail(id: string | number) {
    return await invoke<ClipConfig>("get_clip_config_detail", { id });
}

/**
 * 根据 Id 修改裁剪参数
 * 
 */

export async function update_clip_config(params: WithRequired<ClipConfig, "id">) {
    return await invoke("update_clip_config", {
        id: params.id,
        name: params.name,
        bodyType: params.body_type,
        part: params.part,
        top: params.top,
        right: params.right,
        bottom: params.bottom,
        left: params.left,
        radius: params.radius,
        source: params.source
    })
}