import { renderHook, act } from "@testing-library/react";
import { useTldrawSettings } from "./useTldrawSettings";

vi.mock("../utils/userSettings", () => ({
  getDarkModeSetting: vi.fn(),
  getFocusModeSetting: vi.fn(),
}));

describe("useTldrawSettings hook", () => {
  it("should handle dark mode change", () => {
    const { result } = renderHook(() => useTldrawSettings());

    act(() => {
      result.current.handleDarkModeChange(true);
    });

    expect(result.current.isDarkMode).toBe(true);
  });

  it("should handle focus mode change", () => {
    const { result } = renderHook(() => useTldrawSettings());

    act(() => {
      result.current.handleFocusModeChange(true);
    });

    expect(result.current.isFocusMode).toBe(true);
  });
});
