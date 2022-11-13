import { ComponentChildren } from "preact";

interface PageContainerProps {
    children?: ComponentChildren
}

export function PageContainer<FC>({ children }: PageContainerProps) {
    return <div className="h-full">{children}</div>
}