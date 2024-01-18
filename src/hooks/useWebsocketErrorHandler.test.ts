import { act, renderHook } from "@testing-library/react";
import { useWebsocketErrorHandler } from "./useWebsocketErrorHandler";
import { provider } from "../stores/setup";
import { redirectToErrorPage } from "../utils/redirectUtils";
import { setErrorData } from "../utils/errorData";

vi.mock("../stores/setup", () => {
  return {
    provider: {
      ws: null,
      disconnect: vi.fn(),
    },
  };
});

vi.mock("../utils/redirectUtils", () => ({
  redirectToErrorPage: vi.fn(),
}));

vi.mock("../utils/errorData", () => ({
  setErrorData: vi.fn(),
  clearErrorData: vi.fn(),
}));

describe("useWebsocketErrorHandler hook", () => {
  let mockWs: WebSocket;

  beforeEach(() => {
    mockWs = new WebSocket("ws://localhost");
    provider.ws = mockWs;
  });

  afterEach(() => {
    vi.clearAllMocks();
    provider.ws = null;
  });

  it("should handle WebSocket close event and call redirect and setErrorData", () => {
    renderHook(() => useWebsocketErrorHandler());

    act(() => {
      const closeEvent = new CloseEvent("close", { code: 4500 });
      mockWs.dispatchEvent(closeEvent);
    });

    expect(setErrorData).toHaveBeenCalledWith(500, "tldraw.error.ws.4500");
    expect(redirectToErrorPage).toHaveBeenCalled();
  });
});
