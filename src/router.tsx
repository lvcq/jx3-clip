import Router from "preact-router";
import { Redirect } from "@components/redirect";
import { ClipConfigPage } from "@pages/configuration/clip/edit";
import { ClipConfigListPage } from "@pages/configuration/clip/list";
import { ProjectEditPage } from "@pages/project/edit";
import { FrameConfigListPage } from "@pages/configuration/frame/list";
import { FrameConfigPage } from "@pages/configuration/frame/edit"

export function AppRouter() {
    return <Router>
        <Redirect path="/" to="/config/clip"></Redirect>
        <ClipConfigListPage path="/config/clip"></ClipConfigListPage>
        <ClipConfigPage path="/config/clip/edit/:id?"></ClipConfigPage>
        <ProjectEditPage path="/project/edit"></ProjectEditPage>
        <FrameConfigListPage path="/config/frame"/>
        <FrameConfigPage path="/config/frame/edit/:id?"/>
    </Router>
}

