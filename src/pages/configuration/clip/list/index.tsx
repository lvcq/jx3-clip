import { get_all_clip_config } from "@backend/apis/clip_config";
import { ClipConfig } from "@backend/model";
import { PageContainer } from "@components/page-container";
import { BodyType } from "@data/body-type";
import { Part } from "@data/part";
import { allClipConfigAtom } from "@store/clip-config.store";
import { useAtom } from "jotai";
import { useEffect, useState } from "preact/hooks";
import { Card } from "./card";
import { FilterField } from "./filter-field";

interface ClipConfigListPageProps {
    path?: string;
}

export function ClipConfigListPage<FC>({ }: ClipConfigListPageProps) {
    const [list, updateList] = useAtom(allClipConfigAtom)
    const [bodyTypes, updateBodyTypes] = useState<Array<BodyType>>([BodyType.BOY, BodyType.FEMALE, BodyType.GIRL, BodyType.MALE]);
    const [parts, updateParts] = useState<Array<Part>>([Part.CLOTHES, Part.HAIR]);
    const [viewList, updateViewList] = useState<Array<ClipConfig>>([]);

    useEffect(() => {
        async function fetchList() {
            let clist = await get_all_clip_config();
            updateList(clist);
        }
        fetchList();
    }, []);

    useEffect(() => {
        let filterList = list.filter(item => bodyTypes.includes(item.body_type) && parts.includes(item.part));
        updateViewList(filterList);
    }, [list, bodyTypes, parts])

    return <PageContainer>
        <div className="flex overflow-hidden h-full">
            <div className="flex-1 px-3 py-4 overflow-y-auto">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewList.map(item => <Card key={item.id} info={item} />)}
                </div>
            </div>
            <div className="w-1/4 shadow-sm">
                <FilterField
                    checkedBodyTypes={bodyTypes}
                    checkedParts={parts}
                    onBodyTypesChange={updateBodyTypes}
                    onPartsChange={updateParts} />
            </div>
        </div>
    </PageContainer>
}