import { TDSnapshot } from '@tldraw/tldraw';

export const STORAGE_SETTINGS_KEY = 'sc_tldraw_settings';

export const getUserSettings = (): TDSnapshot['settings'] | undefined => {
	const settingsString = localStorage.getItem(STORAGE_SETTINGS_KEY);
	return settingsString ? JSON.parse(settingsString) : undefined;
};
