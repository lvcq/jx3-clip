import { ClipConfig } from "@backend/apis/clip_config";
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


export const panelWidthAtom = atom<number>((get) => {
    let hair = get(hairConfigAtom);
    let hariPanelWidth = hair.cols > 0 ? (hair.width * hair.cols + hair.colgap * (hair.cols - 1)) : 0;
    let clothes = get(clothesConfigAtom);
    let clothesPanelWidth = clothes.cols > 0 ? (clothes.width * clothes.cols + clothes.colgap * (clothes.cols - 1)) : 0;
    if (hariPanelWidth === 0 || clothesPanelWidth === 0) {
        return Math.max(hariPanelWidth, clothesPanelWidth);
    } else {
        return Math.min(hariPanelWidth, clothesPanelWidth);
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

export const scaleFactorAtom = atom(100);

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

        } else {
            set(selectionAtom, {
                part: update.part,
                list: [update.key]
            })
        }
    });

export const clearProjectAtom = atom(null, (get, set) => {
    set(hairConfigAtom, {
        images: [],
        rowgap: 0,
        colgap: 0,
        cols: 5,
        width: 0,
        height: 0
    });
    set(clothesConfigAtom, {
        images: [],
        rowgap: 0,
        colgap: 0,
        cols: 5,
        width: 0,
        height: 0
    });
    set(scaleFactorAtom, 100);
    set(selectionAtom, {
        part: Part.HAIR,
        list: []
    })
});
