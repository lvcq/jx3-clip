import { useEffect, useRef, useState } from "preact/hooks";
import { listen_backend_message, stop_backend_listen } from "@backend";
import { Provider } from "jotai";

import "./app.css";
import { AppRouter } from "./router";
import { GlobalNotice } from "@components/global-notice";
import { Subscription } from "rxjs";
import { globalMessage$ } from "@backend/message";
import { GlobalMessageTypes } from "@backend/model";
import { OpenProjectModal } from "@components/open-project";


export function App<FC>() {
  const messageSub = useRef<Subscription | null>(null);
  const [openProjectVisible, updateOpenProjectVisible] = useState(false);
  useEffect(() => {
    listen_backend_message();
    messageSub.current = globalMessage$.subscribe(({ type, payload }) => {
      switch (type) {
        case GlobalMessageTypes.OpenProject:
          updateOpenProjectVisible(true);
          break;
      }
    });
    return () => {
      stop_backend_listen();
    }
  }, []);

  return (
    <Provider>
      <AppRouter />
      <GlobalNotice></GlobalNotice>
      {
        openProjectVisible ? <OpenProjectModal visible={openProjectVisible} onClose={() => {
          updateOpenProjectVisible(false);
        }} /> : null
      }
    </Provider>
  );
}
