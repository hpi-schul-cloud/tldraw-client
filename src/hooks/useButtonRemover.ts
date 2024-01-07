import { useEffect, useRef } from "react";

export function useButtonRemover() {
  const buttonsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const regex = /^TD-Link-/;

    const observer = new MutationObserver(() => {
      if (buttonsRef.current) {
        const buttons = buttonsRef.current.querySelectorAll("button");
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
  }, []);

  return buttonsRef;
}
