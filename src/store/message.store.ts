import { atom } from "jotai";

type MessageType = "info" | "success" | "warning" | "error";
interface MessageOptions {
    type?: MessageType,
    message: string;
}

export const visibleAtom = atom(false);
export const messageAtom = atom("");
export const messageTypeAtom = atom<MessageType>("success");

export const globalNoticeAtom = atom<null, MessageOptions>(
    null,
    (get, set, options) => {
        set(visibleAtom, true);
        set(messageAtom, options.message);
        set(messageTypeAtom, options.type || "success");
    }
)
