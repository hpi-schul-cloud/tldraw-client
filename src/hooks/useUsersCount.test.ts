import { renderHook, act } from "@testing-library/react";
import { useUsersCount } from "./useUsersCount";
import { room } from "../stores/setup";

vi.mock("../stores/setup", () => {
  return {
    room: {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    },
  };
});

describe("useUsersCount hook", () => {
  it("should subscribe to room on mount and unsubscribe on unmount", () => {
    const { result, unmount } = renderHook(() => useUsersCount());

    expect(result.current).toBe(0);
    expect(room.subscribe).toHaveBeenCalled();
    expect(room.unsubscribe).not.toHaveBeenCalled();

    act(() => {
      unmount();
    });

    expect(room.unsubscribe).toHaveBeenCalled();
  });
});
