import { useState } from "react";
import { getDarkModeSetting, getFocusModeSetting } from "../utils/userSettings";

export function useTldrawSettings() {
  const initialDarkModeState = getDarkModeSetting();
  const initialFocusModeState = getFocusModeSetting();

  const [isDarkMode, setIsDarkMode] = useState(initialDarkModeState);
  const [isFocusMode, setIsFocusMode] = useState(initialFocusModeState);

  const handleDarkModeChange = (isDarkMode: boolean) => {
    setIsDarkMode(isDarkMode);
  };

  const handleFocusModeChange = (isFocusMode: boolean) => {
    setIsFocusMode(isFocusMode);
  };

  return {
    isDarkMode,
    isFocusMode,
    handleDarkModeChange,
    handleFocusModeChange,
  };
}
