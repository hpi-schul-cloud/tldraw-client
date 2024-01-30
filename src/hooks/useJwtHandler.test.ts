import { act, renderHook } from "@testing-library/react";
import * as cookie from "react-cookie";
import * as redirectUtils from "../utils/redirectUtils";
import { useJwtHandler } from "./useJwtHandler";

vi.mock("../stores/setup", () => {
  return {
    roomId: "test_room_id",
  };
});

vi.mock("react-cookie", () => ({
  useCookies: vi.fn(),
}));

describe("useJwtHandler hook", () => {
  const setup = () => {
    const mockRedirectToLoginPage = vi.spyOn(
      redirectUtils,
      "redirectToLoginPage",
    );
    const useCookiesSpy = vi.spyOn(cookie, "useCookies");

    return {
      mockRedirectToLoginPage,
      useCookiesSpy,
    };
  };

  it("should redirect to login page when token is not present", () => {
    const { mockRedirectToLoginPage, useCookiesSpy } = setup();
    useCookiesSpy.mockReturnValueOnce([
      { jwt: undefined },
      () => {},
      () => {},
      () => {},
    ]);

    renderHook(() => useJwtHandler());

    expect(mockRedirectToLoginPage).toHaveBeenCalled();
  });

  it("should not redirect when token is present", () => {
    const { mockRedirectToLoginPage, useCookiesSpy } = setup();
    useCookiesSpy.mockReturnValueOnce([
      { jwt: "valid_token" },
      () => {},
      () => {},
      () => {},
    ]);

    renderHook(() => useJwtHandler());

    expect(mockRedirectToLoginPage).not.toHaveBeenCalled();
  });

  it("should redirect when token becomes empty", () => {
    const { mockRedirectToLoginPage, useCookiesSpy } = setup();
    useCookiesSpy
      .mockReturnValueOnce([
        { jwt: "valid_token" },
        () => {},
        () => {},
        () => {},
      ])
      .mockReturnValueOnce([{ jwt: undefined }, () => {}, () => {}, () => {}]);

    expect(mockRedirectToLoginPage).not.toHaveBeenCalled();

    const { rerender } = renderHook(() => useJwtHandler());

    act(() => {
      rerender();
    });

    expect(mockRedirectToLoginPage).toHaveBeenCalled();
  });
});
