import { get_frame_config_detail } from "@backend/apis/frame_config";
import { PageContainer } from "@components/page-container";
import { clearFrameConfigAtom, frameConfigAtom } from "@store/frame-config.store";
import { useAtom } from "jotai";
import { useEffect } from "preact/hooks";
import { DrawImage } from "./draw-image";
import { Settings } from "./settings";

interface FrameConfigPageProps {
    path?: string;
    id?: string;
}

export function FrameConfigPage<FC>({ id }: FrameConfigPageProps) {
    const [, updateFrameConfig] = useAtom(frameConfigAtom);
    const [,clearFrameConfig]= useAtom(clearFrameConfigAtom);

    useEffect(() => {
        async function getDetail() {
            try {
                if (id) {
                    let data = await get_frame_config_detail(Number(id));
                    updateFrameConfig(data);
                }else{
                    clearFrameConfig();
                }
            } catch (err) {
                console.log(err);
                clearFrameConfig();
            }
        }
        updateFrameConfig({
            id: undefined,
            name: "",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            source: "",
        })
        getDetail();
    }, [id]);
    return <PageContainer>
        <div className="h-full flex overflow-hidden">
            <div className="flex-1">
                <DrawImage />
            </div>
            <div className="w-1/4 p-3">
                <Settings />
            </div>
        </div>
    </PageContainer>
}