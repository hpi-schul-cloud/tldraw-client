export const getConnectionOptions = async (): Promise<{
  roomName: string;
  websocketUrl: string;
}> => {
  const urlParams = new URLSearchParams(window.location.search);

  const connectionOptions = {
    roomName: urlParams.get("roomName") ?? "",
    websocketUrl: "ws://localhost:3345",
  };

  try {
    const response = await fetch(`/tldraw-client-runtime.config.json`);

    if (!response.ok) {
      console.error(
        "Error fetching tldrawServerURL",
        response.status,
        response.statusText,
      );
    }

    const data: { tldrawServerURL: string } = await response.json();
    connectionOptions.websocketUrl = data.tldrawServerURL;
  } catch (error) {
    console.error("Error fetching tldrawServerURL:", error);
  }

  return connectionOptions;
};
