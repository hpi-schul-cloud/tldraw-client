import { checkAuthentication } from "./authCheck";
import { redirectToLoginPage } from "./redirectUtils";

describe("authCheck", () => {
  beforeAll(() => {
    vi.mock("./redirectUtils", { spy: true });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkAuthentication", () => {
    describe("when user is authenticated", () => {
      const setup = () => {
        vi.stubGlobal("fetch", () =>
          Promise.resolve({
            status: 200,
          }),
        );
      };

      it("should not redirect to login page", async () => {
        setup();

        await checkAuthentication();

        expect(redirectToLoginPage).not.toHaveBeenCalled();
      });
    });

    describe("when user is not authenticated", () => {
      const setup = () => {
        vi.stubGlobal("fetch", () =>
          Promise.resolve({
            status: 401,
          }),
        );
      };

      it("should redirect to login page", async () => {
        setup();

        await checkAuthentication();

        expect(redirectToLoginPage).toHaveBeenCalled();
      });
    });

    describe("when fetch fails for some other reason", () => {
      const setup = () => {
        vi.stubGlobal("fetch", () =>
          Promise.resolve({
            status: 500, // Example of an error code that is not 401
          }),
        );
      };

      it("should not redirect to login page", async () => {
        setup();

        await checkAuthentication();

        expect(redirectToLoginPage).not.toHaveBeenCalled();
      });
    });
  });
});
