import { renderHook, act } from "@testing-library/react";
import { useUsers } from "./useUsers";
import { room } from "../stores/setup";

vi.mock("../stores/setup", () => {
  return {
    room: {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    },
  };
});

describe("useUsers hook", () => {
  it("should subscribe to room on mount and unsubscribe on unmount", () => {
    const { result, unmount } = renderHook(() => useUsers());

    expect(result.current).toStrictEqual([]);
    expect(room.subscribe).toHaveBeenCalled();
    expect(room.unsubscribe).not.toHaveBeenCalled();

    act(() => {
      unmount();
    });

    expect(room.unsubscribe).toHaveBeenCalled();
  });
});
