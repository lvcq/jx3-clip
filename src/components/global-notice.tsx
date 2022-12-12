import { messageAtom, messageTypeAtom, visibleAtom } from "@store/message.store"
import { useAtom } from "jotai"
import { useEffect, useRef } from "preact/hooks";


export function GlobalNotice<FC>() {
    const [message] = useAtom(messageAtom);
    const [type] = useAtom(messageTypeAtom);
    const [visable, updateVisable] = useAtom(visibleAtom);
    const timeRef = useRef<any>(0);
    useEffect(() => {
        return () => {
            if (timeRef.current) {
                clearTimeout(timeRef.current);
            }
        }
    }, []);

    useEffect(() => {
        if (timeRef.current) {
            clearTimeout(timeRef.current);
        }
        if (visable) {
            timeRef.current = setTimeout(() => {
                updateVisable(false);
            }, 5000);
        }
    }, [visable]);

    if (!visable) {
        return null;
    }
    return <div className="shadow-md fixed top-8 right-1 px-4 py-2 bg-white rounded">
        <span className={"global-message-" + type}>{message}</span>
    </div>
}

