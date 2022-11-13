export enum BodyType {
    MALE = 0,
    FEMALE = 1,
    GIRL = 2,
    BOY = 3,
}

export interface BodyTypeRef {
    key: BodyType;
    label: string;
}

export const bodyTypeRefs: Array<BodyTypeRef> = [
    {
        key: BodyType.MALE,
        label: "成男"
    }, {
        key: BodyType.FEMALE,
        label: "成女"
    }, {
        key: BodyType.GIRL,
        label: "萝莉"
    }, {
        key: BodyType.BOY,
        label: "正太"
    }
]

export function getBodyType(num: number): BodyType | null {
    switch (num) {
        case BodyType.MALE:
            return BodyType.MALE;
        case BodyType.FEMALE:
            return BodyType.FEMALE;
        case BodyType.GIRL:
            return BodyType.GIRL;
        case BodyType.BOY:
            return BodyType.GIRL;
        default:
            return null;
    }
}