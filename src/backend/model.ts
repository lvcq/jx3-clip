import { BodyType } from "@data/body-type";
import { Part } from "@data/part";

export enum MenuList {
    ClipConfig = "ClipConfig",
    FrameConfig = "FrameConfig",
    CreateNewProject = "CreateNewProject",
    OpenProject = "OpenProject"
}

export interface MenuMessage {
    event_type: "menuChange",
    next: MenuList
}

export type PayloadMessage = MenuMessage;

export enum GlobalMessageTypes{
    OpenProject= "OpenProject"
}


interface OpenProjectMessage{
    type:GlobalMessageTypes.OpenProject
    payload:undefined
}

export type GlobalMessage = OpenProjectMessage;

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



export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

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
export interface ProjectDetail {
    name: string
    config: ProjectConfig
}

export interface ProjectBrief {
    name: string
    path: string
}

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
