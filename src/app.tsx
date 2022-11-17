import { useEffect } from "preact/hooks";
import { listen_backend_message, stop_backend_listen } from "@backend";
import { Provider } from "jotai";

import "./app.css";
import { AppRouter } from "./router";
import { GlobalMessage } from "@components/global-message";
import { GlobalModal } from "@components/global-modal";

export function App<FC>() {

  useEffect(() => {
    listen_backend_message();
    return () => {
      stop_backend_listen();
    }
  }, []);

  return (
    <Provider>
      <AppRouter />
      <GlobalMessage></GlobalMessage>
      <GlobalModal></GlobalModal>
    </Provider>
  );
}
