import { ClipConfig } from "@backend/apis/clip_config";
import { Part } from "@data/part";
import { atom } from "jotai";
import { allClipConfigAtom } from "./clip-config.store";

export const selectedPartAtom=atom<Part>(Part.HAIR);
export const selectedClipConfigAtom =atom<ClipConfig|undefined>(undefined);
export const filteredClipConfigAtom = atom((get)=>{
    const part = get(selectedPartAtom);
    const list = get(allClipConfigAtom);
    return list.filter(item=>item.part===part);   
})