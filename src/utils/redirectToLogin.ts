import { roomId } from "../stores/yProvider";

export const redirectToLogin = () => {
  if (window.location.host.startsWith("localhost")) {
    window.location.href = `http://localhost:4000/login?redirect=tldraw?roomName=${roomId}`;
  } else {
    window.location.href = `/login?redirect=/tldraw?roomName=${roomId}`;
  }
};
