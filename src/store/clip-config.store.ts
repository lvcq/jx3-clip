import { ClipConfig, get_all_clip_config } from "@backend/apis/clip_config";
import { BodyType } from "@data/body-type";
import { Part } from "@data/part";
import { atom } from "jotai";

export const configIdAtom = atom<number|null>(null);
export const bodyType = atom<BodyType>(BodyType.MALE);
export const partAtom = atom<Part>(Part.HAIR);
export const SourceAtom = atom<string>("");
export const configNameAtom = atom<string>("");
export const clipParamsAtom = atom({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    radius: 0,
});

export const clipTopAtom = atom<number, number>((get) => get(clipParamsAtom).top, (get, set, top) => {
    set(clipParamsAtom, {
        ...get(clipParamsAtom),
        top
    });
});

export const clipRightAtom = atom<number, number>((get) => get(clipParamsAtom).right, (get, set, right) => {
    set(clipParamsAtom, {
        ...get(clipParamsAtom),
        right
    });
});

export const clipBottomAtom = atom<number, number>((get) => get(clipParamsAtom).bottom, (get, set, bottom) => {
    set(clipParamsAtom, {
        ...get(clipParamsAtom),
        bottom
    });
});

export const clipLeftAtom = atom<number, number>((get) => get(clipParamsAtom).left, (get, set, left) => {
    set(clipParamsAtom, {
        ...get(clipParamsAtom),
        left
    });
});

export const clipRadiusAtom = atom<number, number>((get) => get(clipParamsAtom).radius, (get, set, radius) => {
    set(clipParamsAtom, {
        ...get(clipParamsAtom),
        radius
    });
});

export const allClipConfigAtom = atom<Array<ClipConfig>>([]);