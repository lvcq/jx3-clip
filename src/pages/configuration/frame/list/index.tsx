import { get_all_frame_config } from "@backend/apis/frame_config";
import { PageContainer } from "@components/page-container";

import { frameConfigListAtom } from "@store/frame-config.store";
import { useAtom } from "jotai";
import { route } from "preact-router";
import { useEffect } from "preact/hooks";
import { Card } from "./card";

interface FrameConfigListPageProps {
    path?: string;
}

export function FrameConfigListPage<FC>({ }: FrameConfigListPageProps) {
    const [list, updateList] = useAtom(frameConfigListAtom);
    useEffect(() => {
        async function fetchList() {
            let clist = await get_all_frame_config();
            updateList(clist);
        }
        fetchList();
    }, []);

    function handleCreateNewClick() {
        route("/config/frame/edit");
    }

    return <PageContainer>
        <div className="box-border h-full p-4 overflow-x-auto">
            <div className="flex">
                {list.map(item => <Card key={item.id} info={item} />)}
            </div>
        </div>
        <div
            className="fixed bottom-8 right-8 w-16 h-16 z-10 flex justify-center items-center bg-primary text-white shadow-lg cursor-pointer shadow-blue-200 rounded-full leading-none hover:ring-2 hover:ring-blue-300"
            onClick={handleCreateNewClick}>
            <span className="text-4xl">+</span>
        </div>
    </PageContainer>
}