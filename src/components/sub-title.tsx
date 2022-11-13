import { ComponentChildren } from "preact";

interface SubTitleProps{
    children?: ComponentChildren
}

export function SubTitle<FC>({ children }:SubTitleProps){
    return <div className="text-base font-bold p-2">{children}</div>
}