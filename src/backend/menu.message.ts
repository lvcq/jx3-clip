import { route } from 'preact-router';
import { Observable } from 'rxjs';
import { MenuMessage } from './model';

const menuMap = {
    ClipConfig: "/config/clip",
    CreateNewProject: "/project/edit",
    FrameConfig: "/config/frame"
}

export function start_listen_menu_message(obser: Observable<MenuMessage>) {
    obser.subscribe((message) => {
        const path = menuMap[message.next];
        if (path) {
            route(path);
        }
    })
}