
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