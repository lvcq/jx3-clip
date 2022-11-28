import { centralRegionAtom } from "@store/project.store";
import { useAtom } from "jotai";
import { useEffect, useState } from "preact/hooks";


export function CentralRegion<FC>() {
    const [centralConfig] = useAtom(centralRegionAtom);
    const [wrapperStyle, updateWrapperstyle] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        updateWrapperstyle({
            "padding-top": `${centralConfig.vPadding}px`,
            "padding-bottom": `${centralConfig.vPadding}px`,
        })
    }, [centralConfig.vPadding]);

    return <div style={wrapperStyle}>
    </div>
}