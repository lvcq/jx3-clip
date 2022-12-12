import { get_all_project_api, ProjectBrief } from "@backend/apis/project_apis";
import { WebviewWindow } from "@tauri-apps/api/window";
import { route } from "preact-router";
import { useEffect, useState } from "preact/hooks"
import { Modal } from "./global-modal"

interface OpenProjectModalProps {
    visible?: boolean
    onClose?: () => void
}


export function OpenProjectModal({ visible, onClose }: OpenProjectModalProps) {
    const [projectList, updateProjectList] = useState<ProjectBrief[]>([]);
    const [activePath, updateActivePath] = useState<string>("")
    useEffect(() => {
        async function getAllProject() {
            try {
                let list = await get_all_project_api();
                updateProjectList(list)
            } catch (err) {
                console.log(err)
            }
        }
        getAllProject();
    }, [visible]);

    function handleProjectClick(path: string) {
        updateActivePath(path);
    }

    async function handleOpenProject(path: string, name: string) {
        let openConfirm = window.confirm("是否在新窗口打开？");
        let isOpenInNewWindow = false;
        if (typeof openConfirm === "boolean") {
            isOpenInNewWindow = openConfirm;
        } else {
            isOpenInNewWindow = await openConfirm;
        }
        let project_path = `/project/edit?ProjectPath=${path}`
        if (isOpenInNewWindow) {
            const webWindow = new WebviewWindow(`create-new-project-${Math.random().toString(36).substring(2)}`, {
                url: project_path,
                title: name,
                width: 800,
                height: 600,
                x: 200,
                y: 100,
                fileDropEnabled: false
            });
            webWindow.once("tauri://created", () => {
                console.log("create window success.")
            });
            webWindow.once("tauri://error", (e) => {
                console.log("create window error:", e);
            });
        } else {
            route(project_path);
        }
    }
    return <Modal visible={visible} onClose={onClose}>
        <ul className="mb-1 last-of-type:mb-0 py-2 px-4 cursor-pointer hover:bg-blue-50" style={{ width: "600px" }}>
            {
                projectList.map(item => {
                    return <li key={item.path} className={`break-all whitespace-normal ${activePath === item.path ? 'bg-blue-500 text-white' : ''}`} onClick={() => handleProjectClick(item.path)}>
                        <h3>{item.name}</h3>
                        <span className="text-gray-300">{item.path}</span>
                    </li>
                })
            }
        </ul>
    </Modal>
}