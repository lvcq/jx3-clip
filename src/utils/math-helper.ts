export function getDivisor(num: number) {
    if (num <= 0) {
        return [];
    }
    let result: number[] = [];
    let d = 1;
    while (num / d >= d) {
        if (num % d === 0) {
            let r = num / d;
            if (r !== d) {
                result.push(r, d);
            } else {
                result.push(r);
                break;
            }
        }
        d +=1;
    }
    return result.sort((a, b) => a - b);
}