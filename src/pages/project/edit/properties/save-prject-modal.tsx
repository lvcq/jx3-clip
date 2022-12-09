import { FormItem } from "@components/form-item"
import { Modal } from "@components/global-modal"
import { projectNameAtom } from "@store/project.store"
import { checkProjectExists } from "@utils/fileopt"
import { useAtom } from "jotai"
import { TargetedEvent } from "preact/compat"

interface SaveProjectModalProps {
    visible?: boolean
    onClose?: () => void
}
export function SaveProjectModal<FC>({ visible, onClose }: SaveProjectModalProps) {

    const [projectName, updateProjectName] = useAtom(projectNameAtom);

    async function handleSave() {
        if (!projectName) {
            alert("项目名称不能为空");
            return;
        }
        let isExists = await checkProjectExists(projectName);
        if (isExists) {
            alert("项目名已存在");
            return;
        }
    }


    function handleNameChange(event: TargetedEvent<HTMLInputElement>) {
        let value = event.currentTarget.value.trim();
        updateProjectName(value);
    }


    return <Modal title="保存项目" visible={visible} onClose={onClose} onOk={handleSave}>
        <FormItem label="项目名称">
            <input value={projectName} onChange={handleNameChange} />
        </FormItem>
    </Modal>
}