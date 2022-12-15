import { PageContainer } from "@components/page-container";
import { Properties } from "./properties";
import { allClipConfigAtom } from "@store/clip-config.store";
import { useEffect } from "preact/hooks";
import { get_all_clip_config } from "@backend/apis/clip_config";
import { useAtom, useSetAtom } from "jotai";
import { Worktop } from "./worktop";
import { get_all_frame_config } from "@backend/apis/frame_config";
import { frameConfigListAtom } from "@store/frame-config.store";
import { clearProjectAtom, loadProjectAtom } from "@store/project.store";

interface ProjectEditPageProps {
    path?: string
    projectPath?: string
}

export function ProjectEditPage<FC>({ projectPath }: ProjectEditPageProps) {
    const [, updateList] = useAtom(allClipConfigAtom);
    const [, updateFrameList] = useAtom(frameConfigListAtom);
    const clearProject = useSetAtom(clearProjectAtom);
    const loadProject = useSetAtom(loadProjectAtom);

    useEffect(() => {
        const closeConfirm = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        }
        window.addEventListener('beforeunload', closeConfirm);
        return () => {
            window.removeEventListener('beforeunload', closeConfirm);
        }
    }, []);

    useEffect(() => {
        async function getAllClipConfig() {
            let list = await get_all_clip_config();
            updateList(list);
        }

        async function getAllFrameConfig() {
            let list = await get_all_frame_config();
            updateFrameList(list);
        }
        if (projectPath) {
            loadProject(projectPath)
        }
        clearProject();
        getAllClipConfig();
        getAllFrameConfig();
    }, []);
    return <PageContainer>
        <div className="h-full flex overflow-hidden">
            <div className="flex-1 overflow-hidden">
                <Worktop />
            </div>
            <div className="w-1/4 shadow p-4 pr-0">
                <Properties />
            </div>
        </div>
    </PageContainer>
}