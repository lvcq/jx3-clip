import { ComponentChild, ComponentChildren } from "preact"

interface FormItemProps {
    children?: ComponentChildren,
    label?: ComponentChild
}
export function FormItem<FC>({ children, label }: FormItemProps) {
    return <label className="flex items-center mb-2">
        <span className="w-16">{label}:</span>
        <div className="flex-1">{children}</div>
    </label>
}