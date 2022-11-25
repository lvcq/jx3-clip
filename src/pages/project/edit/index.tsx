import { PageContainer } from "@components/page-container";
import { Properties } from "./properties";
import { allClipConfigAtom } from "@store/clip-config.store";
import { useEffect } from "preact/hooks";
import { get_all_clip_config } from "@backend/apis/clip_config";
import { useAtom } from "jotai";
import { Worktop } from "./worktop";

interface ProjectEditPageProps {
    path?: string;
}

export function ProjectEditPage<FC>({ }: ProjectEditPageProps) {
    const [, updateList] = useAtom(allClipConfigAtom);
    useEffect(() => {
        async function getAllClipConfig() {
            let list = await get_all_clip_config();
            updateList(list);
        }
        getAllClipConfig();
    }, []);
    return <PageContainer>
        <div className="h-full flex overflow-hidden">
            <div className="flex-1 overflow-hidden">
                <Worktop/>
            </div>
            <div className="w-1/4 shadow p-4">
                <Properties />
            </div>
        </div>
    </PageContainer>
}