import { ProjectConfig, save_project_api } from "@backend/apis/project_apis"
import { FormItem } from "@components/form-item"
import { Modal } from "@components/global-modal"
import { globalNoticeAtom } from "@store/message.store"
import { clothesConfigAtom, hairConfigAtom, projectNameAtom } from "@store/project.store"
import { checkProjectExists } from "@utils/fileopt"
import { useAtom } from "jotai"
import { TargetedEvent } from "preact/compat"

interface SaveProjectModalProps {
    visible?: boolean
    onClose?: () => void
}
export function SaveProjectModal<FC>({ visible, onClose }: SaveProjectModalProps) {

    const [projectName, updateProjectName] = useAtom(projectNameAtom);
    const [, updateGlobalMessage] = useAtom(globalNoticeAtom);
    const [hairConfig] = useAtom(hairConfigAtom);
    const [clothesConfig] = useAtom(clothesConfigAtom);

    async function handleSave() {
        try {
            if (!projectName) {
                alert("项目名称不能为空");
                return;
            }
            let isExists = await checkProjectExists(projectName);
            if (isExists) {
                alert("项目名已存在");
                return;
            }
            let config: ProjectConfig = {};
            if (hairConfig.images.length) {
                const { images, width, height, cols, colgap, rowgap, frame } = hairConfig;
                config.hair = {
                    images: images.map(item => item.url),
                    width,
                    height,
                    cols,
                    colgap,
                    rowgap,
                };
                if (frame) {
                    let { source, width, height, top, right, bottom, left } = frame;
                    config.hair.frame_config = {
                        source,
                        width: width!,
                        height: height!,
                        top, right, bottom, left
                    };
                }
            }
            if (clothesConfig.images.length) {
                const { images, width, height, cols, colgap, rowgap, frame } = clothesConfig;
                config.clothes = {
                    images: images.map(item => item.url),
                    width,
                    height,
                    cols,
                    colgap,
                    rowgap,
                };
                if (frame) {
                    let { source, width, height, top, right, bottom, left } = frame;
                    config.clothes.frame_config = {
                        source,
                        width: width!,
                        height: height!,
                        top, right, bottom, left
                    };
                }
            }
            await save_project_api({
                name: projectName,
                config
            });
            updateGlobalMessage({
                type: "success",
                message: "项目保存成功"
            });
        } catch (err: any) {
            updateGlobalMessage({
                type: "error",
                message: err.message || "项目保存失败"
            })
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