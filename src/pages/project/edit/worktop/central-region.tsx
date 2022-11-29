import { centralRegionAtom, scaleFactorAtom } from "@store/project.store";
import { useAtom } from "jotai";
import { useEffect, useState } from "preact/hooks";


export function CentralRegion<FC>() {
    const [centralConfig] = useAtom(centralRegionAtom);
    const [wrapperStyle, updateWrapperstyle] = useState<{ [key: string]: string }>({});
    const [scale] = useAtom(scaleFactorAtom);

    useEffect(() => {
        const vPadding = Math.floor(centralConfig.vPadding * scale / 100);
        updateWrapperstyle({
            "padding-top": `${vPadding}px`,
            "padding-bottom": `${vPadding}px`,
        })
    }, [centralConfig.vPadding, scale]);

    return <div style={wrapperStyle}>
    </div>
}