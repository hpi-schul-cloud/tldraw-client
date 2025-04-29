import { renderHook } from "@testing-library/react";
import { checkAuthentication } from "../utils/authCheck";
import { useAuthCheck } from "./useAuthCheck";

describe("useAuthCheck", () => {
  const delay = 10 * 1000;

  beforeAll(() => {
    vi.mock("../utils/authCheck", { spy: true });
    vi.useFakeTimers();
  });

  it("should set interval on mount and clear it on unmount", () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");

    const { unmount } = renderHook(() => useAuthCheck());

    expect(setIntervalSpy).toHaveBeenCalledWith(checkAuthentication, delay);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("should call checkAuthentication every 10 seconds", () => {
    renderHook(() => useAuthCheck());

    vi.advanceTimersByTime(delay);

    expect(checkAuthentication).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(delay);

    expect(checkAuthentication).toHaveBeenCalledTimes(2);
  });
});
