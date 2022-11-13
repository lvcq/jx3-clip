
export enum MenuList {
    ClipConfig = "ClipConfig"
}

export interface MenuMessage {
    event_type: "menuChange",
    next: MenuList
}

export type PayloadMessage=MenuMessage;
