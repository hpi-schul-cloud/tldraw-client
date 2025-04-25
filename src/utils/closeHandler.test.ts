import { WebsocketProvider } from "y-websocket";
import { handleWsClose } from "./closeHandler";
import { setErrorData } from "./errorData";
import { redirectToErrorPage } from "./redirectUtils";

describe("closeHandler", () => {
  beforeAll(() => {
    vi.mock("./errorData", { spy: true });
    vi.mock("./redirectUtils", { spy: true });
  });

  describe("handleWsClose", () => {
    describe("when the event code does not correspond to a specified error", () => {
      const setup = () => {
        const event = {
          code: 1000, // Example code that does not match any specified error
        } as CloseEvent;

        const providerMock = {
          disconnect: vi.fn(),
        } as unknown as WebsocketProvider;

        return { event, providerMock };
      };

      it("should not call setErrorData or redirectToErrorPage nor disconnect", () => {
        const { event, providerMock } = setup();

        handleWsClose(event, providerMock);

        expect(setErrorData).not.toHaveBeenCalled();
        expect(redirectToErrorPage).not.toHaveBeenCalled();
        expect(providerMock.disconnect).not.toHaveBeenCalled();
      });
    });

    describe("when the event code corresponds to a specified error", () => {
      const setup = () => {
        const event = {
          code: 4401, // Example code that matches a specified error
        } as CloseEvent;

        const providerMock = {
          disconnect: vi.fn(),
        } as unknown as WebsocketProvider;

        return { event, providerMock };
      };

      it("should call setErrorData and redirectToErrorPage and disconnect", () => {
        const { event, providerMock } = setup();

        handleWsClose(event, providerMock);

        expect(setErrorData).toHaveBeenCalledWith(401, "error.4401");
        expect(redirectToErrorPage).toHaveBeenCalled();
        expect(providerMock.disconnect).toHaveBeenCalled();
      });
    });
  });
});
