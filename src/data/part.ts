export enum Part {
    HAIR = 0,
    CLOTHES = 1,
}

export interface PartRef {
    key: Part,
    label: string;
}

export const partRefs: Array<PartRef> = [
    {
        key: Part.HAIR,
        label: "头发"
    }, {
        key: Part.CLOTHES,
        label: "衣服"
    }
];

export function getPart(num: number): Part | null {
    switch (num) {
        case Part.HAIR:
            return Part.HAIR;
        case Part.CLOTHES:
            return Part.CLOTHES;
        default:
            return null;
    }
}

export function getPartLabel(type: Part): string | null {
    let item = partRefs.find(item => item.key === type);
    if (item) {
        return item.label;
    } else {
        return null;
    }
}
