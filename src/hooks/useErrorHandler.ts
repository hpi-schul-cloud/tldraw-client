import { useEffect, useState } from "react";
import { envsResponse, provider, userResponse } from "../stores/yProvider";
import { redirectToLogin } from "../utils/redirectToLogin";

const websocketErrors = [
  {
    code: 4400,
    title: "Validation error",
    message: "Room name is missing in URL params.",
    showRedirectButton: false,
  },
  {
    code: 4401,
    title: "Authorization error",
    message:
      "You don't have permission to this board or your session expired. Try logging in again.",
    showRedirectButton: true,
  },
  {
    code: 4404,
    title: "Validation error",
    message: "Board with this name was not found.",
    showRedirectButton: false,
  },
  {
    code: 4500,
    title: "Connection error",
    message: "Unable to establish websocket connection.",
    showRedirectButton: false,
  },
];

const apiErrors = [
  {
    code: 401,
    title: "Authorization error",
    message: "Not authorized or session expired. Try logging in again.",
    showRedirectButton: true,
  },
  {
    code: 500,
    title: "General error",
    message: "There was an error while getting data from the server.",
    showRedirectButton: false,
  },
];

export function useErrorHandler() {
  const [showModal, setShowModal] = useState(false);
  const [showRedirectButton, setShowRedirectButton] = useState(false);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    setShowModal(false);
  };

  const handleRedirect = () => {
    redirectToLogin();
  };

  const showApiErrorForCode = (code: number) => {
    const error = apiErrors.find((element) => element.code === code)!;
    setShowModal(true);
    setShowRedirectButton(error.showRedirectButton);
    setErrorTitle(error.title);
    setErrorMessage(error.message);
  };

  useEffect(() => {
    const responseCodes = [envsResponse.code, userResponse.code];
    if (responseCodes.some((code) => code === 200)) {
      return;
    }

    if (responseCodes.some((code) => code === 401)) {
      showApiErrorForCode(401);
    } else {
      showApiErrorForCode(500);
    }
  }, []);

  useEffect(() => {
    if (!envsResponse.envs?.FEATURE_TLDRAW_ENABLED) {
      setShowModal(true);
      setShowRedirectButton(false);
      setErrorTitle("General error");
      setErrorMessage("Tldraw feature is disabled.");
    }
  }, []);

  useEffect(() => {
    const handleWsClose = (event: CloseEvent) => {
      const error = websocketErrors.find(
        (element) => element.code === event.code,
      );
      if (!error) return;

      setErrorTitle(error.title);
      setErrorMessage(error.message);
      setShowRedirectButton(error.showRedirectButton);
      setShowModal(true);

      provider.disconnect();
    };

    provider.ws?.addEventListener("close", handleWsClose);

    return () => {
      provider.ws?.removeEventListener("close", handleWsClose);
    };
  }, []);

  return {
    showModal,
    showRedirectButton,
    errorTitle,
    errorMessage,
    handleClose,
    handleRedirect,
  };
}
