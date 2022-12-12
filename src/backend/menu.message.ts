import { route } from 'preact-router';
import { Observable } from 'rxjs';
import { GlobalMessageTypes, MenuList, MenuMessage } from './model';
import { WebviewWindow } from "@tauri-apps/api/window"
import { sendGlobalMessage } from './message';

const menuMap = {
    ClipConfig: "/config/clip",
    FrameConfig: "/config/frame"
};
const openNewWindowMenuMap = {
    CreateNewProject: "/project/edit",
}

export function start_listen_menu_message(obser: Observable<MenuMessage>) {
    obser.subscribe(async (message) => {
        switch (message.next) {
            case MenuList.OpenProject:
                sendGlobalMessage(GlobalMessageTypes.OpenProject);
                break;
            case MenuList.ClipConfig:
            case MenuList.FrameConfig:
                routeToPage(message.next);
                break;
            case MenuList.CreateNewProject:
                openInNewWindowOrNot(message.next);
                break;
        }
    });

}

async function openInNewWindowOrNot(code: MenuList) {
    const path = Reflect.get(openNewWindowMenuMap, code);
    if (path) {
        let openConfirm = window.confirm("是否在新窗口打开？");
        let openNew = false;
        if (typeof openConfirm === "boolean") {
            openNew = openConfirm;
        } else {
            openNew = await openConfirm;
        }
        if (openNew) {
            const webWindow = new WebviewWindow(`create-new-project-${Math.random().toString(36).substring(2)}`, {
                url: path,
                title: "新建项目",
                width: 800,
                height: 600,
                x: 200,
                y: 100,
                fileDropEnabled: false
            });
            webWindow.once("tauri://created", () => {
                console.log("create window success.")
            });
            webWindow.once("tauri://error", (e) => {
                console.log("create window error:", e);
            });
        }else{
            route(path);
        }
    }
}

function routeToPage(code: MenuList) {
    const path = Reflect.get(menuMap, code);
    if (path) {
        route(path);
    }
}
