import { JSX, createPortal, useState } from "preact/compat";
import { ComponentChildren } from "preact";


interface ModalProps {
    visible?: boolean;
    title?: JSX.Element | string | null;
    children?: ComponentChildren;
    onClose?: () => void;
    onOk?: () => Promise<void>;
}

export function Modal({ visible, title, children, onClose, onOk }: ModalProps) {

    const container = document.getElementById('modals') as HTMLElement;
    const [isProcess, updateIsProcess] = useState<boolean>(false);

    function handleCloseClick() {
        if (onClose) {
            onClose();
        }
    }

    async function handleOkClick() {
        updateIsProcess(true);
        setTimeout(async () => {
            if (onOk) {
                try {
                    await onOk();
                } finally {
                    updateIsProcess(false);
                }
            }
        }, 300);
    }

    if (!visible) {
        return null
    }

    return <>
        {
            createPortal(<div className="fixed top-0 right-0 bottom-0 left-0 z-10 flex overflow-hidden items-center justify-center bg-opacity-75 bg-gray-500">
                <div className="rounded bg-white">
                    <div className="flex px-4 py-2 items-center">
                        <span>{title}</span>
                        <div className="flex-1"></div>
                        <div className="w-4 h-4 leading-4 text-center cursor-pointer" onClick={handleCloseClick}>x</div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                    <div className="p-4">{
                        children
                    }</div>
                    <div className="h-px bg-gray-200"></div>
                    <div className="px-4 py-2 text-right">
                        <button className="py-px px-2 rounded border-solid border border-gray-300 hover:ring-2 ring-gray-200" onClick={handleCloseClick}>取消</button>
                        <button className="ml-2 py-px px-2 rounded bg-primary text-white hover:ring-2 ring-primary" disabled={isProcess} onClick={handleOkClick}>{isProcess ? "处理中" : "确定"}</button>
                    </div>
                </div>
            </div>, container)
        }
    </>

}