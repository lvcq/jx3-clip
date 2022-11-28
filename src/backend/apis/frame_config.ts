
import { invoke } from "@tauri-apps/api";

export interface FrameConfig {
    id?: number;
    name: string;
    top: number;
    left: number;
    right: number;
    bottom: number;
    width?: number;
    height?: number;
    source: string;
    create_at?: number;
}
type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * 新建边框
 */
export async function create_frame_config(params: FrameConfig) {
    return await invoke("create_frame_config", {
        name: params.name,
        top: params.top,
        left: params.left,
        right: params.right,
        bottom: params.bottom,
        source: params.source
    })
}

/**
 * 获取所有边框配置
 */
export async function get_all_frame_config() {
    return await invoke<Array<FrameConfig>>("get_all_frame_config")
}

/**
 * 根据ID删除配置
 */
export async function delete_frame_config(id: string | number) {
    try {
        await invoke<boolean>("delete_frame_config", { id });
        return true;
    } catch {
        return false;
    }
}

/**
 * 根据ID获取边框数据详情
 */

export async function get_frame_config_detail(id: string | number) {
    return await invoke<FrameConfig>("get_frame_config_detail", { id });
}

/**
 * 根据 Id 修改边框参数
 * 
 */

export async function update_frame_config(params: WithRequired<FrameConfig, "id">) {
    return await invoke("update_frame_config", {
        id: params.id,
        name: params.name,
        top: params.top,
        left: params.left,
        right: params.right,
        bottom: params.bottom,
        source: params.source
    })
}
