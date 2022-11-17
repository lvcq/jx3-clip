import { atom } from "jotai";
import { JSX } from "preact";

interface ModalConfig {
    visiable: boolean;
    title: string;
    content: JSX.Element | null;
    onCancel: (() => void) | undefined;
    onOk: (() => void) | undefined;
}

export const visiableAtom = atom(false);
export const titleAtom = atom("");
export const contentAtom = atom<JSX.Element | null>(null);
export const onCancelAtom = atom<(() => void) | undefined>(undefined);
export const onOkAtom = atom<(() => void) | undefined>(undefined);

export const modalConfigAtom = atom<ModalConfig, Partial<ModalConfig> & Pick<ModalConfig, "visiable">>((get) => {
    return {
        visiable: get(visiableAtom),
        title: get(titleAtom),
        content: get(contentAtom),
        onCancel: get(onCancelAtom),
        onOk: get(onOkAtom)
    }
}, (get, set, config) => {
    if (config.visiable) {
        set(visiableAtom, true);
        set(titleAtom, config.title || "");
        set(contentAtom, config.content || null);
        set(onCancelAtom, config.onCancel);
        set(onOkAtom, config.onOk);
    } else {
        set(visiableAtom, false);
        set(titleAtom, "");
        set(contentAtom, null);
        set(onCancelAtom, undefined);
        set(onOkAtom, undefined);
    }
})