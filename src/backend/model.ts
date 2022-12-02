
export enum MenuList {
    ClipConfig = "ClipConfig",
    FrameConfig = "FrameConfig",
    CreateNewProject = "CreateNewProject"
}

export interface MenuMessage {
    event_type: "menuChange",
    next: MenuList
}

export type PayloadMessage = MenuMessage;
