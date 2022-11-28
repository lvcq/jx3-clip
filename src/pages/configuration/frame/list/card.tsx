import { delete_frame_config, get_all_frame_config, FrameConfig } from "@backend/apis/frame_config";
import { DividerH } from "@components/divider-h";
import { frameConfigListAtom } from "@store/frame-config.store";
import { globalMessageAtom } from "@store/message.store";
import { useAtom } from "jotai";
import { route } from "preact-router";
import { ImageViewer } from "./image-viewer";

interface CardProps {
    info?: FrameConfig
}

export function Card<FC>({ info }: CardProps) {
    const [message, updateMessage] = useAtom(globalMessageAtom);
    const [list, updateConfigList] = useAtom(frameConfigListAtom)

    function handleGotoEdit() {
        if (info?.id) {
            route(`/config/frame/edit/${info.id}`)
        }
    }

    async function handleDelete() {
        if (info?.id) {
            if (window.confirm(`是否确定删除配置 ${info.name}`)) {
                const result = await delete_frame_config(info.id);
                if (result) {
                    const list = await get_all_frame_config();
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

    return <div className="mr-4 rounded p-3 shadow w-36">
        <div className="mx-auto w-32 h-32">
            <ImageViewer source={info?.source!} />
        </div>
        <div className="my-2 px-1 overflow-hidden whitespace-nowrap text-ellipsis" title={info?.name}>{info?.name}</div>
        <div className="px-2">
            <button className="bg-primary hover:ring-2 ring-blue-300 text-white px-2 py-px rounded" onClick={handleGotoEdit}>编辑</button>
            <button className="bg-red-500 hover:ring-2 ring-red-300 text-white ml-2 px-2 py-px rounded" onClick={handleDelete}>删除</button>
        </div>
    </div>
}