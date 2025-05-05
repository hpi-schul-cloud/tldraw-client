import * as reactCookie from "react-cookie";
import { useLogoutHandler } from "./useLogoutHandler";
import { renderHook } from "@testing-library/react";
import { redirectToLoginPage } from "../utils/redirectUtils";

describe("useLogoutHandler", () => {
  beforeAll(() => {
    vi.mock("react-cookie");
    vi.mock("../utils/redirectUtils", { spy: true });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect if isLoggedIn cookie is undefined", () => {
    const useCookiesMock = vi.spyOn(reactCookie, "useCookies");

    useCookiesMock.mockReturnValue([
      { isLoggedIn: undefined },
      () => {},
      () => {},
      () => {},
    ]);

    renderHook(() => useLogoutHandler());

    expect(redirectToLoginPage).toHaveBeenCalled();
  });

  it("should not redirect if isLoggedIn cookie has value true", () => {
    const useCookiesMock = vi.spyOn(reactCookie, "useCookies");

    useCookiesMock.mockReturnValue([
      { isLoggedIn: true },
      () => {},
      () => {},
      () => {},
    ]);

    renderHook(() => useLogoutHandler());

    expect(redirectToLoginPage).not.toHaveBeenCalled();
  });
});
