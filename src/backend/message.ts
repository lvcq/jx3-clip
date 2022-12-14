import { appWindow } from "@tauri-apps/api/window";
import { UnlistenFn } from "@tauri-apps/api/event";
import { filter, Subject } from "rxjs";
import { start_listen_menu_message } from "./menu.message";
import { GlobalMessage, GlobalMessageTypes, PayloadMessage } from "./model";

const eventObser = new Subject<PayloadMessage>();
let unlisten: Promise<UnlistenFn> | null = null;
const globalMessage = new Subject<GlobalMessage>();

export function listen_backend_message() {
    unlisten = appWindow.listen<PayloadMessage>("backMessage", (event) => {
        eventObser.next(event.payload);
    });
    start_listen_menu_message(eventObser.pipe(filter(item => item.event_type === "menuChange")))
}

export async function stop_backend_listen() {
    try {
        if (unlisten) {
            (await unlisten)();
        }
    } catch {

    }

}

export function sendGlobalMessage(type: GlobalMessageTypes, payload?: any) {
    globalMessage.next({
        type,
        payload
    })
}

export const globalMessage$ = globalMessage.asObservable();