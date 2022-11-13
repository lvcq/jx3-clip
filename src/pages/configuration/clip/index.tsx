import { PageContainer } from "@components/page-container";
import { DrawImage } from "./draw-image";
import { Settings } from "./settings";

export function ClipConfigPage<FC>(){
    return <PageContainer>
        <div className="h-full flex overflow-hidden">
            <div className="flex-1">
                <DrawImage/>
            </div>
            <div className="w-1/4 p-3">
                <Settings/>
            </div>
        </div>
    </PageContainer>
}