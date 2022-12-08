import { FormItem } from "@components/form-item"
import { Modal } from "@components/global-modal"
import { TargetedEvent } from "preact/compat"

interface SaveProjectModalProps {
    visible?: boolean
    onClose?: () => void
}
export function SaveProjectModal<FC>({ visible, onClose }: SaveProjectModalProps) {

    async function handleSave() {

    }

    function handleNameChange(event: TargetedEvent<HTMLInputElement>) {

    }

    return <Modal title="保存项目" visible={visible} onClose={onClose}>
        <FormItem label="项目名称">
            <input />
        </FormItem>
    </Modal>
}