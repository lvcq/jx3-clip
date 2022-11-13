import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { filter, Subject } from "rxjs";
import { start_listen_menu_message } from "./menu.message";
import { PayloadMessage } from "./model";

const eventObser = new Subject<PayloadMessage>();
let unlisten: Promise<UnlistenFn> | null = null;

export function listen_backend_message() {
    unlisten = listen<PayloadMessage>("backMessage", (event) => {
        eventObser.next(event.payload);
    });
    start_listen_menu_message(eventObser.pipe(filter(item => item.event_type === "menuChange")))
}

export async function stop_backend_listen() {
    try{
        if (unlisten) {
            (await unlisten)();
        }
    }catch{
        
    }

} 