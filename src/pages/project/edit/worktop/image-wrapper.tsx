import { ContextMenu } from "@components/context-menu";
import { dragElementKeyAtom, dragOverElementKeyAtom } from "@store/drag.store";
import { selectionAtom, selectionManagerAtom } from "@store/project.store";
import { loadLocalImage } from "@utils/fileopt";
import { useAtom } from "jotai";
import { TargetedEvent, useEffect, useState } from "preact/compat";
import "./style.css";

interface ImageWrapperProps {
    url?: string;
    type?: number;
    id?: string;
    onMove?: (source: string, target: string) => void;
    onDelete?: (key: string) => void;
    imgStyle?: string | JSX.CSSProperties | JSX.SignalLike<string | JSX.CSSProperties>;
    frameUrl?: string | null;
}

export function ImageWrapper<FC>({
    url,
    type,
    id,
    onMove,
    onDelete,
    imgStyle,
    frameUrl }: ImageWrapperProps) {

    const [dragged, updateDragged] = useAtom(dragElementKeyAtom);
    const [overEle, updateOverEle] = useAtom(dragOverElementKeyAtom);
    const [, updateSelection] = useAtom(selectionManagerAtom);
    const [selection] = useAtom(selectionAtom);
    const [imgUrl, updateImgUrl] = useState("");
    useEffect(() => {
        async function getImageUrl() {
            if (url) {
                const bUrl = await loadLocalImage(url);
                updateImgUrl(bUrl);
            }
            else {
                updateImgUrl("")
            }
        }
        getImageUrl();
    }, [url]);

    function handleDragStart(evt: TargetedEvent<HTMLDivElement, DragEvent>) {
        if (evt.dataTransfer) {
            evt.dataTransfer.effectAllowed = "move"
            evt.dataTransfer.setData("text/plain", JSON.stringify({
                type,
                id
            }))
        }
        updateDragged(id as string);
    }

    function handleDragEnd(evt: TargetedEvent<HTMLDivElement, DragEvent>) {
        updateDragged("");
        updateOverEle("");
    }

    function handleDragOver(e: TargetedEvent<HTMLDivElement, DragEvent>) {
        e.preventDefault();
        return false;
    }

    function handleDragEnter(e: TargetedEvent<HTMLDivElement, DragEvent>) {
        updateOverEle(id as string);
    }

    function handleDragLeave(e: TargetedEvent<HTMLDivElement, DragEvent>) {
        if (overEle === id) {
            updateOverEle("");
        }
    }
    function handleDrop(e: TargetedEvent<HTMLDivElement, DragEvent>) {
        e.stopPropagation();
        e.preventDefault();
        if (dragged !== id && e.dataTransfer) {
            try {
                let data = e.dataTransfer.getData('text/plain');
                let dataObj = JSON.parse(data);
                if (dataObj.type === type && onMove && id) {
                    onMove(dataObj.id, id);
                }
            } catch {

            }

        }
    }

    function handleItemClick(event: TargetedEvent<HTMLDivElement, MouseEvent>) {
        event.stopPropagation();
        updateSelection({
            part: type!,
            key: id!,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey
        });
    }

    function handleDeleteItem() {
        if (onDelete && id) {
            onDelete(id);
        }
    }

    return <div
        className={"w-full h-full relative" + (dragged === id ? " draged-elm" : "") + (overEle === id ? " drag-over" : "") + (selection.list.includes(id!) ? " selected-ele" : "")}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
    >
        {
            frameUrl ? (
                <>
                    <div style={imgStyle}>
                        <img className="w-full" src={imgUrl} alt="" />
                    </div>
                    <div className="absolute top-0 right-0 bottom-0 left-0">
                        <img className="w-full h-full" src={frameUrl} alt="" />
                    </div>

                </>
            ) : (
                <img className="w-full" src={imgUrl} alt="" />
            )
        }

        <div className="absolute top-0 right-0 bottom-0 left-0 z-10 marker" onDrop={handleDrop} onDragOver={handleDragOver} onClick={handleItemClick}>
            <ContextMenu>
                <ul className="w-20">
                    <li className="px-2 py-0.5 cursor-pointer" onClick={handleDeleteItem}>删除</li>
                </ul>
            </ContextMenu>
        </div>
    </div>
}