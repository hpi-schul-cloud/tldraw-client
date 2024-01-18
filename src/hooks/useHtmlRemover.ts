import React, { useEffect } from "react";

export function useHtmlRemover(
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const regex = /^TD-Link-/;

    const observer = new MutationObserver(() => {
      if (containerRef.current) {
        const buttons = containerRef.current.querySelectorAll("button");
        buttons.forEach((button) => {
          if (regex.test(button.id)) {
            button.style.display = "none";
          }
        });

        const hrElement = document.querySelector("hr");
        if (hrElement) {
          hrElement.style.display = "none";
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);
}
