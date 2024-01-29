import { TDSnapshot, TldrawApp } from "@tldraw/tldraw";

const STORAGE_SETTINGS_KEY = "sc_tldraw_settings";

const getUserSettings = (): TDSnapshot["settings"] | undefined => {
  const settingsString = localStorage.getItem(STORAGE_SETTINGS_KEY);
  return settingsString ? JSON.parse(settingsString) : undefined;
};

const getDarkModeSetting = (): boolean | undefined => {
  const settings = getUserSettings();

  // returning undefined means that the system default will be used
  return settings ? settings.isDarkMode : undefined;
};

const getFocusModeSetting = (): boolean => {
  const settings = getUserSettings();

  return settings ? settings.isFocusMode : false;
};

const setDefaultState = () => {
  const userSettings = getUserSettings();
  if (userSettings) {
    TldrawApp.defaultState.settings = userSettings;
  } else {
    TldrawApp.defaultState.settings.language = "de";
  }
};

export {
  STORAGE_SETTINGS_KEY,
  setDefaultState,
  getDarkModeSetting,
  getFocusModeSetting,
};
