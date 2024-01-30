import { act, renderHook } from "@testing-library/react";
import { useTldrawUiSanitizer } from "./useTldrawUiSanitizer";

const mutationObserverMock = vi.fn(function MutationObserver(
  this: MutationObserver,
) {
  this.observe = vi.fn();
  this.disconnect = vi.fn();
});

// @ts-expect-error mock window object
window.MutationObserver = mutationObserverMock;

describe("useTldrawUiSanitizer hook", () => {
  it("should call observe on mount and disconnect on unmount", () => {
    const containerRef = { current: document.createElement("div") };
    const { unmount } = renderHook(() => useTldrawUiSanitizer(containerRef));
    const [instance] = mutationObserverMock.mock
      .instances as unknown as MutationObserver[];

    expect(mutationObserverMock.mock.instances.length).toBe(1);
    expect(instance.observe).toHaveBeenCalledTimes(1);

    act(() => {
      unmount();
    });

    expect(instance.disconnect).toHaveBeenCalledTimes(1);
  });
});
