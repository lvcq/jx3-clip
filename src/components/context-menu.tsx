import { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { createPortal, TargetedEvent } from "preact/compat";

interface ContextMenuProps {
    children?: ComponentChildren
}

export function ContextMenu<FC>({ children }: ContextMenuProps) {
    const [open, updateOpen] = useState(false);
    const [offsetTop, updateOffsetTop] = useState(0);
    const [offsetLeft, updateOffsetLeft] = useState(0);
    const container = document.querySelector("#popups")!;
    const [popupStyle, updatePopupStyle] = useState<string | JSX.CSSProperties | JSX.SignalLike<string | JSX.CSSProperties>>({});
    useEffect(() => {
        updatePopupStyle({
            "top": `${offsetTop}px`,
            left: `${offsetLeft}px`
        });
    }, [offsetTop, offsetLeft])

    function handleRightClick(event: TargetedEvent<HTMLDivElement, MouseEvent>) {
        event.stopPropagation();
        event.preventDefault();
        console.log(event);
        let top = event.clientY;
        let left = event.clientX;
        updateOffsetLeft(left);
        updateOffsetTop(top);
        updateOpen(true);
    }

    function handleMaskClick(event: TargetedEvent<HTMLDivElement, MouseEvent>) {
        updateOpen(false);
    }

    if (open) {
        return createPortal(<div className="fixed z-10 top-0 right-0 bottom-0 left-0" onClick={handleMaskClick}>
            <div className="absolute shadow-md p-4 bg-white rounded" style={popupStyle}>{children}</div>
        </div>, container)
    } else {
        return <div className="absolute top-0 right-0 bottom-0 left-0 z-10" onContextMenu={handleRightClick}></div>
    }
}