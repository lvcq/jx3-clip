import { route } from 'preact-router';
import { Observable } from 'rxjs';
import { MenuMessage } from './model';
import { WebviewWindow, getCurrent } from "@tauri-apps/api/window"

const menuMap = {
    ClipConfig: "/config/clip",
    FrameConfig: "/config/frame"
};
const openNewWindowMenuMap = {
    CreateNewProject: "/project/edit",
}

export function start_listen_menu_message(obser: Observable<MenuMessage>) {
    obser.subscribe((message) => {
        const path = Reflect.get(menuMap, message.next);
        if (path) {
            route(path);
        } else {
            let currentWindow = getCurrent();
            if (currentWindow.label !== "main") {
                return;
            }
            const path = Reflect.get(openNewWindowMenuMap, message.next);
            if (path) {
                const window = new WebviewWindow(`create-new-project-${Math.random().toString(36).substring(2)}`, {
                    url: path,
                    title: "新建项目",
                    width: 800,
                    height: 600,
                    x: 200,
                    y: 100,
                    fileDropEnabled: false
                });
                window.once("tauri://created", () => {
                    console.log("create window success.")
                });
                window.once("tauri://error", (e) => {
                    console.log("create window error:", e);
                })
            }
        }
    })
}