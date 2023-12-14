import { TDSnapshot, TldrawApp } from '@tldraw/tldraw';

export const STORAGE_SETTINGS_KEY = 'sc_tldraw_settings';

export const getUserSettings = (): TDSnapshot['settings'] | undefined => {
	const settingsString = localStorage.getItem(STORAGE_SETTINGS_KEY);
	return settingsString ? JSON.parse(settingsString) : undefined;
};

export const setDefaultState = () => {
	const userSettings = getUserSettings();
	if (userSettings) {
		TldrawApp.defaultState.settings = userSettings;
	} else {
		TldrawApp.defaultState.settings.language = 'de';
	}
};
