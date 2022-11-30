import { get_clip_config_detail } from "@backend/apis/clip_config";
import { PageContainer } from "@components/page-container";
import { BodyType, getBodyType } from "@data/body-type";
import { getPart, Part } from "@data/part";
import { bodyType, clearClipConfigAtom, clipParamsAtom, configIdAtom, configNameAtom, partAtom, SourceAtom } from "@store/clip-config.store";
import { useAtom } from "jotai";
import { useEffect } from "preact/hooks";
import { DrawImage } from "./draw-image";
import { Settings } from "./settings";

interface ClipConfigPageProps {
    path?: string;
    id?: string;
}

export function ClipConfigPage<FC>({ id }: ClipConfigPageProps) {
    const [, updateBodyType] = useAtom(bodyType);
    const [, updatePart] = useAtom(partAtom);
    const [, updateName] = useAtom(configNameAtom);
    const [, updateClipParams] = useAtom(clipParamsAtom);
    const [, updateSource] = useAtom(SourceAtom);
    const [, updateConfigId] = useAtom(configIdAtom);
    const [, clearClipConfig] = useAtom(clearClipConfigAtom)

    useEffect(() => {
        async function getDetail() {
            try {
                if (id) {
                    let data = await get_clip_config_detail(Number(id));
                    updateBodyType(getBodyType(data.body_type) || BodyType.MALE);
                    updatePart(getPart(data.part) || Part.HAIR);
                    updateName(data.name);
                    if (data.source) {
                        updateSource(data.source);
                    }
                    updateClipParams({
                        top: data.top,
                        right: data.right,
                        bottom: data.bottom,
                        left: data.left,
                        radius: data.radius
                    })
                } else {
                    clearClipConfig();
                }
            } catch (err) {
                console.log(err);
                clearClipConfig();
            }
        }
        updateBodyType(BodyType.MALE);
        updatePart(Part.HAIR);
        updateName("");
        updateSource("");
        updateClipParams({
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            radius: 0
        })
        if (id === "") {
            updateConfigId(null)
        } else {
            updateConfigId(Number(id));
        }
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