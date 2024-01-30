import { roomId } from "../stores/setup";

export const redirectToLoginPage = () => {
  if (import.meta.env.PROD) {
    window.location.assign(`/login?redirect=/tldraw?roomName=${roomId}`);
  } else {
    window.location.assign(
      `http://localhost:4000/login?redirect=tldraw?roomName=${roomId}`,
    );
  }
};

export const redirectToErrorPage = () => {
  if (import.meta.env.PROD) {
    window.location.assign("/error");
  } else {
    console.warn("Prevented redirect to /error page");
  }
};
