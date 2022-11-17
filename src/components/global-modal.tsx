import { modalConfigAtom } from "@store/modal.store"
import { useAtom } from "jotai"


export function GlobalModal() {

    const [config, updateConfig] = useAtom(modalConfigAtom);

    if (!config.visiable) {
        return null;
    }

    return <div className="fixed top-0 right-0 bottom-0 left-0 z-10 flex overflow-hidden items-center justify-center bg-opacity-75 bg-gray-500">
        <div className="rounded bg-white">
            <div className="flex px-4 py-2 items-center">
                <span>{config.title}</span>
                <div className="flex-1"></div>
                <div className="w-4 h-4 leading-4 text-center cursor-pointer">x</div>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="p-4">{
                config.content
            }</div>
            <div className="h-px bg-gray-200"></div>
            <div className="px-4 py-2 text-right">
                <button className="py-px px-2 rounded border-solid border border-gray-300 hover:ring-2 ring-gray-200">取消</button>
                <button className="ml-2 py-px px-2 rounded bg-primary text-white hover:ring-2 ring-primary">确定</button>
            </div>
        </div>
    </div>
}