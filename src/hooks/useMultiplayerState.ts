import {
	TDAsset,
	TDBinding,
	TDDocument,
	TDFile,
	TDShape,
	TDSnapshot,
	TDUser,
	TldrawApp,
	TldrawPatch,
} from '@tldraw/tldraw';
import { useCallback, useEffect, useState } from 'react';
import { Room } from '@y-presence/client';
import {
	awareness,
	doc,
	provider,
	undoManager,
	yAssets,
	yBindings,
	yShapes,
} from '../store/store';
import { fileOpen } from 'browser-fs-access';
import { TldrawPresence } from '../types';

export const room = new Room<TldrawPresence>(awareness, {});

const STORAGE_SETTINGS_KEY = 'sc_tldraw_settings';

const getUserSettings = (): TDSnapshot['settings'] | undefined => {
	const settingsString = localStorage.getItem(STORAGE_SETTINGS_KEY);
	return settingsString ? JSON.parse(settingsString) : undefined;
};

const setDefaultState = () => {
	const userSettings = getUserSettings();
	if (userSettings) {
		TldrawApp.defaultState.settings = userSettings;
	} else {
		TldrawApp.defaultState.settings.language = 'de';
	}
};

export function useMultiplayerState(roomId: string) {
	const [appInstance, setAppInstance] = useState<TldrawApp | undefined>(
		undefined,
	);
	const [loading, setLoading] = useState<boolean>(true);

	setDefaultState();

	const getDarkMode = (): boolean => {
		const settings = getUserSettings();
		return settings ? settings.isDarkMode : false;
	};

	const saveUserSettings = useCallback(
		(app: TldrawApp, _patch: TldrawPatch, reason: string | undefined) => {
			if (reason?.includes('settings')) {
				localStorage.setItem(
					STORAGE_SETTINGS_KEY,
					JSON.stringify(app.settings),
				);
			}
		},
		[],
	);

	async function openFromFileSystem(): Promise<null | {
		fileHandle: FileSystemFileHandle | null;
		document: TDDocument;
	}> {
		const blob = await fileOpen({
			description: 'Tldraw File',
			extensions: [`.tldr`],
			multiple: false,
		});

		if (!blob) return null;

		const json: string = await new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (reader.readyState === FileReader.DONE) {
					resolve(reader.result as string);
				}
			};
			reader.readAsText(blob, 'utf8');
		});

		const file: TDFile = JSON.parse(json);
		if ('tldrawFileFormatVersion' in file) {
			alert(
				'This file was created in a newer version of tldraw. Please visit www.tldraw.com to open it.',
			);
			return null;
		}

		const fileHandle = blob.handle ?? null;

		return {
			fileHandle,
			document: file.document,
		};
	}

	const onMount = useCallback((app: TldrawApp) => {
		console.log('onMount executed');
		app.loadRoom(roomId);
		console.log('after roomId');
		app.pause();
		console.log('after pause');
		setAppInstance(app);

		app.openProject = async () => {
			console.log('NIE RACZEJ NIE');
			try {
				const result = await openFromFileSystem();
				if (!result) {
					throw Error();
				}

				const { document } = result;

				yShapes.clear();
				yBindings.clear();
				yAssets.clear();

				doc.transact(() => {
					Object.entries(document.pages.page.shapes).forEach(([id, shape]) => {
						if (!shape) {
							yShapes.delete(id);
						} else {
							yShapes.set(shape.id, shape);
						}
					});
					Object.entries(document.pages.page.bindings).forEach(
						([id, binding]) => {
							if (!binding) {
								yBindings.delete(id);
							} else {
								yBindings.set(binding.id, binding);
							}
						},
					);
					Object.entries(document.assets).forEach(([id, asset]) => {
						if (!asset) {
							yAssets.delete(id);
						} else {
							yAssets.set(asset.id, asset);
						}
					});
				});

				app.zoomToFit();
				console.log(document);
			} catch (e) {
				console.error(e);
			}
		};
	}, []);

	const onChangePage = useCallback(
		(
			app: TldrawApp,
			shapes: Record<string, TDShape | undefined>,
			bindings: Record<string, TDBinding | undefined>,
			assets: Record<string, TDAsset | undefined>,
		) => {
			undoManager.stopCapturing();
			doc.transact(() => {
				Object.entries(shapes).forEach(([id, shape]) => {
					if (!shape) {
						yShapes.delete(id);
					} else {
						yShapes.set(shape.id, shape);
					}
				});
				Object.entries(bindings).forEach(([id, binding]) => {
					if (!binding) {
						yBindings.delete(id);
					} else {
						yBindings.set(binding.id, binding);
					}
				});
				Object.entries(assets).forEach(([id, asset]) => {
					if (!asset) {
						yAssets.delete(id);
					} else {
						yAssets.set(asset.id, asset);
					}
				});
			});
		},
		[],
	);

	const onUndo = useCallback(() => {
		undoManager.undo();
	}, []);

	const onRedo = useCallback(() => {
		undoManager.redo();
	}, []);

	const onChangePresence = useCallback(
		(app: TldrawApp, user: TDUser) => {
			if (!app.room) return;
			room.setPresence({ id: app.room.userId, tdUser: user });
		},
		[room.updatePresence],
	);

	/**
	 * Update app users whenever there is a change in the room users
	 */
	useEffect(() => {
		if (!appInstance || !room) return;

		const unsubOthers = room.subscribe('others', (users) => {
			if (!appInstance.room) return;

			const ids = users
				.filter((user) => user.presence && user.presence.tdUser)
				.map((user) => user.presence!.tdUser!.id);

			// remove any user that is not connected in the room
			Object.values(appInstance.room.users).forEach((user) => {
				if (
					user &&
					!ids.includes(user.id) &&
					user.id !== appInstance.room?.userId
				) {
					appInstance.removeUser(user.id);
				}
			});

			appInstance.updateUsers(
				users
					.filter((user) => user.presence && user.presence.tdUser)
					.map((other) => other.presence!.tdUser!)
					.filter(Boolean),
			);
		});

		return () => {
			unsubOthers();
		};
	}, [appInstance]);

	useEffect(() => {
		if (!appInstance) return;

		function handleDisconnect() {
			provider.disconnect();
		}

		window.addEventListener('beforeunload', handleDisconnect);

		function handleChanges() {
			appInstance?.replacePageContent(
				Object.fromEntries(yShapes.entries()),
				Object.fromEntries(yBindings.entries()),
				Object.fromEntries(yAssets.entries()),
			);
		}

		async function setup() {
			yShapes.observeDeep(handleChanges);
			handleChanges();
			setLoading(false);
		}

		setup();

		return () => {
			window.removeEventListener('beforeunload', handleDisconnect);
			yShapes.unobserveDeep(handleChanges);
		};
	}, [appInstance]);

	return {
		onMount,
		onChangePage,
		onUndo,
		onRedo,
		loading,
		onChangePresence,
		saveUserSettings,
		getDarkMode,
	};
}
