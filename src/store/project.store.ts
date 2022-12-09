import { ClipConfig } from "@backend/apis/clip_config";
import { FrameConfig } from "@backend/apis/frame_config";
import { Part } from "@data/part";
import { atom } from "jotai";

export interface ImageItem {
    url: string;
    key: string;
}

interface WorktopGridConfig {
    images: ImageItem[];
    rowgap: number;
    colgap: number;
    cols: number;
    width: number;
    height: number;
    frame?: FrameConfig
}

export const selectedClipConfigAtom = atom<ClipConfig | undefined>(undefined);


export const hairConfigAtom = atom<WorktopGridConfig>({
    images: [],
    rowgap: 0,
    colgap: 0,
    cols: 5,
    width: 0,
    height: 0
});

export const hairImagesAtom = atom<Array<ImageItem>, Array<ImageItem>>((get) => {
    return get(hairConfigAtom).images
}, (get, set, list) => {
    set(hairConfigAtom, {
        ...get(hairConfigAtom),
        images: list
    })
});

export const hairRowgapAtom = atom<number, number>((get) => get(hairConfigAtom).rowgap, (get, set, gap) => set(hairConfigAtom, { ...get(hairConfigAtom), rowgap: gap }));
export const hairColgapAtom = atom<number, number>((get) => get(hairConfigAtom).colgap, (get, set, gap) => set(hairConfigAtom, { ...get(hairConfigAtom), colgap: gap }));
export const hairColsAtom = atom<number, number>((get) => get(hairConfigAtom).cols, (get, set, cols) => set(hairConfigAtom, { ...get(hairConfigAtom), cols }));
export const hairWithAtom = atom<number, number>((get) => get(hairConfigAtom).width, (get, set, width) => set(hairConfigAtom, { ...get(hairConfigAtom), width }));
export const hairHeightAtom = atom<number, number>((get) => get(hairConfigAtom).height, (get, set, height) => set(hairConfigAtom, { ...get(hairConfigAtom), height }));
export const hairFrameConfigAtom = atom<FrameConfig | undefined, FrameConfig | undefined>(
    get => get(hairConfigAtom).frame,
    (get, set, frame) => {
        set(hairConfigAtom, {
            ...get(hairConfigAtom),
            frame
        })
    }
);

export const clothesConfigAtom = atom<WorktopGridConfig>({
    images: [],
    rowgap: 0,
    colgap: 0,
    cols: 5,
    width: 0,
    height: 0
});

export const clothesImagesAtom = atom<Array<ImageItem>, Array<ImageItem>>((get) => get(clothesConfigAtom).images, (get, set, images) => {
    set(clothesConfigAtom, {
        ...get(clothesConfigAtom),
        images
    })
});

export const clothesRowgapAtom = atom<number, number>(
    (get) => get(clothesConfigAtom).rowgap,
    (get, set, gap) => set(clothesConfigAtom, { ...get(clothesConfigAtom), rowgap: gap })
);
export const clothesColgapAtom = atom<number, number>(
    (get) => get(clothesConfigAtom).colgap,
    (get, set, gap) => set(clothesConfigAtom, { ...get(clothesConfigAtom), colgap: gap })
);
export const clothesColsAtom = atom<number, number>(
    (get) => get(clothesConfigAtom).cols,
    (get, set, cols) => set(clothesConfigAtom, { ...get(clothesConfigAtom), cols })
);

export const clothesWidthAtom = atom<number, number>(
    (get) => get(clothesConfigAtom).width,
    (get, set, width) => set(clothesConfigAtom, { ...get(clothesConfigAtom), width })
);

export const clothesHeightAtom = atom<number, number>(
    (get) => get(clothesConfigAtom).height,
    (get, set, height) => set(clothesConfigAtom, { ...get(clothesConfigAtom), height })
);

export const clothesFrameConfigAtom = atom<FrameConfig | undefined, FrameConfig | undefined>(
    get => get(clothesConfigAtom).frame,
    (get, set, frame) => {
        set(clothesConfigAtom, {
            ...get(clothesConfigAtom),
            frame
        })
    }
);


interface PanelWidthInfo {
    with: number;
    hairFactor: number;
    clothesFactor: number;
}

export const panelWidthAtom = atom<PanelWidthInfo>((get) => {
    let hair = get(hairConfigAtom);
    let hairItemWidth = hair.width;
    if (hair.frame) {
        let { width, left, right } = hair.frame;
        hairItemWidth = Math.floor(width! * hairItemWidth / (right - left))
    }
    let hariPanelWidth = hair.cols > 0 ? (hairItemWidth * hair.cols + hair.colgap * (hair.cols - 1)) : 0;
    let clothes = get(clothesConfigAtom);
    let clothesItemWidth = clothes.width;
    if (clothes.frame) {
        let { width, left, right } = clothes.frame;
        clothesItemWidth = Math.floor(width! * clothesItemWidth / (right - left))
    }
    let clothesPanelWidth = clothes.cols > 0 ? (clothesItemWidth * clothes.cols + clothes.colgap * (clothes.cols - 1)) : 0;
    if (hariPanelWidth === 0 || clothesPanelWidth === 0) {
        let panel = Math.max(hariPanelWidth, clothesPanelWidth);
        return {
            with: panel,
            hairFactor: 1,
            clothesFactor: 1
        }
    } else {
        let panel = Math.min(hariPanelWidth, clothesPanelWidth);
        return {
            with: panel,
            hairFactor: panel / hariPanelWidth,
            clothesFactor: panel / clothesPanelWidth
        }
    }
});



const atomWithLocalStorage = (key: string, initialValue: Object) => {
    const getInitialValue = () => {
        const item = localStorage.getItem(key)
        if (item !== null) {
            return JSON.parse(item)
        }
        return initialValue
    }
    const baseAtom = atom(getInitialValue())
    const derivedAtom = atom(
        (get) => get(baseAtom),
        (get, set, update) => {
            const nextValue =
                typeof update === 'function' ? update(get(baseAtom)) : update
            set(baseAtom, nextValue)
            localStorage.setItem(key, JSON.stringify(nextValue))
        }
    )
    return derivedAtom
}

export const projectCacheAtom = atomWithLocalStorage("projectCacheInfo", "");


const scaleValueAtom = atom(100);

export const scaleFactorDeltaAtom = atom<number, number>((get) => get(scaleValueAtom), (get, set, delta) => {
    let preNum = get(scaleValueAtom);
    let next = preNum + delta;
    if (next > 100) {
        next = 100;
    }
    if (next < 0) {
        next = 0;
    }
    set(scaleValueAtom, next);
});

export const scaleFactorAtom = atom<number, number>(
    (get) => get(scaleValueAtom),
    (get, set, scale) => {
        let next = scale;
        if (next > 100) {
            next = 100;
        }
        if (next < 0) {
            next = 0;
        }
        set(scaleValueAtom, next);
    }
);

interface ImageSelection {
    part: Part;
    list: string[];
}
interface ImageSelectionPayload {
    part: Part;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    key: string;
}

export const selectionAtom = atom<ImageSelection>({
    part: Part.HAIR,
    list: []
});

export const selectionManagerAtom = atom<null, ImageSelectionPayload>(
    null,
    (get, set, update) => {
        let pre = get(selectionAtom);
        let hairImages = get(hairConfigAtom).images;
        let clothesImages = get(clothesConfigAtom).images;
        let imageList = update.part === Part.HAIR ? hairImages : clothesImages;
        if (update.shiftKey || update.ctrlKey) {
            if (pre.part !== update.part && pre.list.length > 0) {
                return;
            }
            if (pre.list.length === 0) {
                set(selectionAtom, {
                    part: update.part,
                    list: [update.key]
                })
            } else {
                let nList: string[] = [];
                let last = pre.list[pre.list.length - 1];
                if (update.shiftKey) {
                    if (last === update.key) {
                        nList = pre.list;
                    } else {
                        let preIndex = imageList.findIndex(item => item.key === last);
                        let nextIndex = imageList.findIndex(item => item.key === update.key);
                        let start = Math.min(preIndex, nextIndex);
                        let end = Math.max(preIndex, nextIndex);
                        nList = imageList.slice(start, end + 1).map(item => item.key);
                    }
                } else if (update.ctrlKey) {
                    if (pre.list.includes(update.key)) {
                        nList = pre.list.filter(item => item !== update.key);
                    } else {
                        nList = [...pre.list, update.key];
                    }
                }
                set(selectionAtom, {
                    part: update.part,
                    list: nList
                })
            }

        } else if (pre.part === update.part && pre.list.length === 1 && pre.list[0] === update.key) {
            set(selectionAtom, {
                part: update.part,
                list: []
            })
        } else {
            set(selectionAtom, {
                part: update.part,
                list: [update.key]
            })
        }
    }
);

export const clearSelectionAtom = atom(null, (get, set) => {
    set(selectionAtom, {
        part: Part.HAIR,
        list: []
    });
})


interface CentralRegion {
    vPadding: number;//上下垂直间距
}

export const centralRegionAtom = atom<CentralRegion>({
    vPadding: 0,
})


export const centralVPaddingAtom = atom<number, number>(
    (get) => get(centralRegionAtom).vPadding,
    (get, set, vp) => {
        set(centralRegionAtom, {
            ...get(centralRegionAtom),
            vPadding: vp
        });
    }
);

export const projectNameAtom = atom<string>("");

export const clearProjectAtom = atom(null, (get, set) => {
    set(hairConfigAtom, {
        images: [],
        rowgap: 0,
        colgap: 0,
        cols: 5,
        width: 0,
        height: 0,
        frame: undefined,
    });
    set(clothesConfigAtom, {
        images: [],
        rowgap: 0,
        colgap: 0,
        cols: 5,
        width: 0,
        height: 0,
        frame: undefined,
    });
    set(scaleFactorDeltaAtom, 100);
    set(selectionAtom, {
        part: Part.HAIR,
        list: []
    });
    set(centralRegionAtom, {
        vPadding: 0
    })
});