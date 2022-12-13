import { ClipConfig, delete_clip_config, get_all_clip_config } from "@backend/apis/clip_config";
import { DividerH } from "@components/divider-h";
import { BodyType, getBodyTypeLabel } from "@data/body-type";
import { getPartLabel } from "@data/part";
import { allClipConfigAtom } from "@store/clip-config.store";
import { globalNoticeAtom } from "@store/message.store";
import { useAtom } from "jotai";
import { route } from "preact-router";
import { ImageViewer } from "./image-viewer";

interface CardProps {
    info?: ClipConfig
}

export function Card<FC>({ info }: CardProps) {
    const [message, updateMessage] = useAtom(globalNoticeAtom);
    const [list,updateConfigList]=useAtom(allClipConfigAtom)

    function handleGotoEdit() {
        if (info?.id) {
            route(`/config/clip/edit/${info.id}`)
        }
    }

    async function handleDelete() {
        if (info?.id) {
            if (window.confirm(`是否确定删除配置 ${info.name}`)) {
                const result = await delete_clip_config(info.id);
                if (result) {
                    const list = await get_all_clip_config();
                    updateConfigList(list);
                    updateMessage({
                        type: "success",
                        message: "删除成功"
                    })
                } else {
                    updateMessage({
                        type: "error",
                        message: "删除失败"
                    })
                }
            }

        }
    }

    return <div className="rounded p-3 shadow flex overflow-hidden items-center">
        <div className="h-full w-20">
            <ImageViewer buffer={info?.thumbnail} />
        </div>
        <div className="flex-1 ml-3">
            <h4>{info?.name}</h4>
            <div className="mt-2">
                {info?.body_type === BodyType.GIRL ? <label className="px-4 py-1 rounded-md leading-4 bg-pink-600 text-white">{getBodyTypeLabel(info.body_type)}</label> : null}
                {info?.body_type === BodyType.FEMALE ? <label className="px-4 py-1 rounded-md leading-4 text-white bg-red-600">{getBodyTypeLabel(info.body_type)}</label> : null}
                {info?.body_type === BodyType.BOY ? <label className="px-4 py-1 rounded-md leading-4 text-white bg-blue-600">{getBodyTypeLabel(info.body_type)}</label> : null}
                {info?.body_type === BodyType.MALE ? <label className="px-4 py-1 rounded-md leading-4 text-white bg-blue-800">{getBodyTypeLabel(info.body_type)}</label> : null}
                {info?.part !== undefined ? <label className="px-4 py-1 ml-2 rounded-md leading-4 text-white bg-indigo-700">{getPartLabel(info.part)}</label> : null}
            </div>
            <div className="leading-8">
                <span>左侧: {info?.left}</span>
                <span className="ml-2">顶部: {info?.top}</span>
            </div>
            <div className="leading-8">
                <span>右侧: {info?.right}</span>
                <span className="ml-2">底部: {info?.bottom}</span>
            </div>
            <div className="leading-8">
                <span>圆角: {info?.radius}</span>
            </div>
            <DividerH />
            <div className="text-right pr-2">
                <button className="bg-primary hover:ring-2 ring-blue-300 text-white px-2 py-px rounded" onClick={handleGotoEdit}>编辑</button>
                <button className="bg-red-500 hover:ring-2 ring-red-300 text-white ml-2 px-2 py-px rounded" onClick={handleDelete}>删除</button>
            </div>
        </div>
    </div>
}