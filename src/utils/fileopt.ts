export function getPreDirFormPath(path: string) {
    const len = path.length;
    let index = len - 1;
    while (index >= 0 && (path.charAt(index) !== "/" && path.charAt(index) !== "\\")) {
        index -= 1;
    }
    return path.substring(0, index);
}