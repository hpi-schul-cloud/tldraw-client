import { toast } from "react-toastify";

let reloadTimeoutId: number | null = null;

export const showConnectionErrorAndReload = (
  message: string = "Connection lost. The page will reload in 10 seconds...",
) => {
  // Clear any existing reload timeout
  if (reloadTimeoutId) {
    window.clearTimeout(reloadTimeoutId);
  }

  // Show error toast
  toast.error(message, {
    position: "top-center",
    autoClose: false,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: false,
  });

  // Force reload after 10 seconds
  reloadTimeoutId = window.setTimeout(() => {
    window.location.reload();
  }, 10000);
};

export const clearConnectionErrorTimeout = () => {
  if (reloadTimeoutId) {
    window.clearTimeout(reloadTimeoutId);
    reloadTimeoutId = null;
  }
};
