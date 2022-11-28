import { ComponentChild, ComponentChildren } from "preact"

interface FormItemProps {
    children?: ComponentChildren,
    label?: ComponentChild
}
export function FormItem<FC>({ children, label }: FormItemProps) {
    return <label className="flex items-center mb-2">
        <span className="mr-1 w-20 text-right">{label}{label ? ":" : null}</span>
        <div className="flex-1">{children}</div>
    </label>
}