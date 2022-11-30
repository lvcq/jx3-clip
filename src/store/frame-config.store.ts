import { atom } from "jotai";
import { FrameConfig } from "@backend/apis/frame_config";

export const frameConfigAtom = atom<FrameConfig>({
    id: undefined,
    name: "",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    source: "",
});

export const frameConfigListAtom = atom<Array<FrameConfig>>([]);

export const frameIdAtom = atom<undefined | number, undefined | number>(
    (get) => get(frameConfigAtom).id,
    (get, set, id) => {
        set(frameConfigAtom, {
            ...get(frameConfigAtom),
            id
        });
    }
);

export const frameNameAtom = atom<string, string>(
    (get) => get(frameConfigAtom).name,
    (get, set, name) => {
        set(frameConfigAtom, {
            ...get(frameConfigAtom),
            name
        });
    }
);

export const frameTopAtom = atom<number, number>(
    (get) => get(frameConfigAtom).top,
    (get, set, top) => {
        set(frameConfigAtom, {
            ...get(frameConfigAtom),
            top
        });
    }
);

export const frameRightAtom = atom<number, number>(
    (get) => get(frameConfigAtom).right,
    (get, set, right) => {
        set(frameConfigAtom, {
            ...get(frameConfigAtom),
            right
        });
    }
);

export const frameBottomAtom = atom<number, number>(
    (get) => get(frameConfigAtom).bottom,
    (get, set, bottom) => {
        set(frameConfigAtom, {
            ...get(frameConfigAtom),
            bottom
        });
    }
);

export const frameLeftAtom = atom<number, number>(
    (get) => get(frameConfigAtom).left,
    (get, set, left) => {
        set(frameConfigAtom, {
            ...get(frameConfigAtom),
            left
        });
    }
);



export const frameSourceAtom = atom<string, string>(
    (get) => get(frameConfigAtom).source,
    (get, set, source) => {
        set(frameConfigAtom, {
            ...get(frameConfigAtom),
            source
        });
    }
);

export const frameDemoImageAtom = atom("");

export const clearFrameConfigAtom = atom(
    null,
    (get, set) => {
        set(frameConfigAtom, {
            id: undefined,
            name: "",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            source: "",
        })
    }
);