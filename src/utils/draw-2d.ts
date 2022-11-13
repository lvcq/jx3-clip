
function point(x: number, y: number) {
    return { x: x, y: y };
};

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function drawRoundedRect(rect: Rect, r: number, ctx: CanvasRenderingContext2D) {
    var ptA = point(rect.x + r, rect.y);
    var ptB = point(rect.x + rect.width, rect.y);
    var ptC = point(rect.x + rect.width, rect.y + rect.height);
    var ptD = point(rect.x, rect.y + rect.height);
    var ptE = point(rect.x, rect.y);
    ctx.beginPath();
    ctx.moveTo(ptA.x, ptA.y);
    ctx.arcTo(ptB.x, ptB.y, ptC.x, ptC.y, r);
    ctx.arcTo(ptC.x, ptC.y, ptD.x, ptD.y, r);
    ctx.arcTo(ptD.x, ptD.y, ptE.x, ptE.y, r);
    ctx.arcTo(ptE.x, ptE.y, ptA.x, ptA.y, r);
    ctx.stroke();
}