import { save_project_api } from "@backend/apis/project_apis"
import { ProjectConfig } from "@backend/model"
import { FormItem } from "@components/form-item"
import { Modal } from "@components/global-modal"
import { globalNoticeAtom } from "@store/message.store"
import { clothesConfigAtom, hairConfigAtom, projectNameAtom } from "@store/project.store"
import { checkProjectExists } from "@utils/fileopt"
import { useAtom, useSetAtom } from "jotai"
import { TargetedEvent } from "preact/compat"

interface SaveProjectModalProps {
    visible?: boolean
    onClose?: () => void
}
export function SaveProjectModal<FC>({ visible, onClose }: SaveProjectModalProps) {

    const [projectName, updateProjectName] = useAtom(projectNameAtom);
    const updateGlobalNotice = useSetAtom(globalNoticeAtom);
    const [hairConfig] = useAtom(hairConfigAtom);
    const [clothesConfig] = useAtom(clothesConfigAtom);

    async function handleSave() {
        try {
            if (!projectName) {
                alert("项目名称不能为空");
                return;
            }
            let isExists = await checkProjectExists(projectName);
            let cover = false;
            if (isExists) {
                let openConfirm = window.confirm(`项目《${projectName}》已存在，是否继续保存？`);
                if (typeof openConfirm === "boolean") {
                    cover = openConfirm;
                } else {
                    cover = await openConfirm;
                }
                if (!cover) {
                    return;
                }
            }
            let config: ProjectConfig = {};
            if (hairConfig.images.length) {
                const { images, width, height, cols, colgap, rowgap, frame,center } = hairConfig;
                config.hair = {
                    images: images.map(item => item.url),
                    width,
                    height,
                    cols,
                    colgap,
                    rowgap,
                    center
                };
                if (frame) {
                    let { source, width, height, top, right, bottom, left, name } = frame;
                    config.hair.frame_config = {
                        name,
                        source,
                        width: width!,
                        height: height!,
                        top, right, bottom, left
                    };
                }
            }
            if (clothesConfig.images.length) {
                const { images, width, height, cols, colgap, rowgap, frame,center } = clothesConfig;
                config.clothes = {
                    images: images.map(item => item.url),
                    width,
                    height,
                    cols,
                    colgap,
                    rowgap,
                    center
                };
                if (frame) {
                    let { source, width, height, top, right, bottom, left, name } = frame;
                    config.clothes.frame_config = {
                        name,
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
            },cover);
            updateGlobalNotice({
                type: "success",
                message: "项目保存成功"
            });
            if (onClose) {
                onClose()
            }
        } catch (err: any) {
            updateGlobalNotice({
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