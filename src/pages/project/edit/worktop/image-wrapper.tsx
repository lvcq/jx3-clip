import { dragElementKeyAtom, dragOverElementKeyAtom } from "@store/drag.store";
import { selectionAtom, selectionManagerAtom } from "@store/project.store";
import { useAtom } from "jotai";
import { TargetedEvent, useState } from "preact/compat";
import "./style.css";

interface ImageWrapperProps {
    url?: string;
    type?: number;
    id?: string;
    onMove?: (source: string, target: string) => void;
}

export function ImageWrapper<FC>({ url, type, id, onMove }: ImageWrapperProps) {

    const [dragged, updateDragged] = useAtom(dragElementKeyAtom);
    const [overEle, updateOverEle] = useAtom(dragOverElementKeyAtom);
    const [, updateSelection] = useAtom(selectionManagerAtom);
    const [selection] = useAtom(selectionAtom);

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
        console.log("enter", id);
        updateOverEle(id as string);
    }

    function handleDragLeave(e: TargetedEvent<HTMLDivElement, DragEvent>) {
        console.log("leave", id);
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
        updateSelection({
            part: type!,
            key: id!,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey
        });
    }

    return <div
        className={"w-full h-full relative" + (dragged === id ? " draged-elm" : "") + (overEle === id ? " drag-over" : "")+ (selection.list.includes(id!)?" selected-ele":"")}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
    >
        <picture className="w-full">
            <source srcset={url}></source>
            <img className="w-full" src={url} alt="" />
        </picture>
        <div className="absolute top-0 right-0 bottom-0 left-0 z-10 marker" onDrop={handleDrop} onDragOver={handleDragOver} onClick={handleItemClick}></div>
    </div>
}