import Router from "preact-router";
import { Redirect } from "@components/redirect";
import { ClipConfigPage } from "@pages/configuration/clip";

export function AppRouter() {
    return <Router>
        <Redirect path="/" to="/config/clip"></Redirect>
        <ClipConfigPage path="/config/clip"></ClipConfigPage>
    </Router>
}

