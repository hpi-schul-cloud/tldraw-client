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
import {
	FileBuilder,
	FileBuilderResult,
	errorLogger,
	STORAGE_SETTINGS_KEY,
	getUserSettings,
	castToString,
} from '../utilities';
import {
	TDAsset,
	TDBinding,
	TDShape,
	TldrawApp,
	TldrawPatch,
	TDUser,
} from '@tldraw/tldraw';

export const room = new Room<TldrawPresence>(awareness, {});

export function useMultiplayerState(roomId: string) {
	const [appInstance, setAppInstance] = useState<TldrawApp | undefined>(
		undefined,
	);
	const [loading, setLoading] = useState<boolean>(true);

	const setDefaultState = () => {
		const userSettings = getUserSettings();
		if (userSettings) {
			TldrawApp.defaultState.settings = userSettings;
		} else {
			TldrawApp.defaultState.settings.language = 'de';
		}
	};

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

	const openFromFileSystem = async (): Promise<null | FileBuilderResult> => {
		try {
			const blob = await fileOpen({
				description: 'Tldraw File',
				extensions: [`.tldr`],
				multiple: false,
			});

			if (!blob) throw new Error('No file selected');

			const json: string | null = await readBlobAsText(blob);

			return FileBuilder.build(json, blob.handle ?? null);
		} catch (error: any) {
			errorLogger('Error opening file', error);
			return null;
		}
	};

	const readBlobAsText = async (blob: Blob): Promise<string | null> =>
		new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (reader.readyState === FileReader.DONE) {
					const result = castToString(reader.result);
					resolve(result);
				}
			};
			reader.readAsText(blob, 'utf8');
		});

	const updateYMapsInTransaction = (
		shapes: Record<string, TDShape | undefined>,
		bindings: Record<string, TDBinding | undefined>,
		assets: Record<string, TDAsset | undefined>,
	) => {
		doc.transact(() => {
			updateYShapes(shapes);
			updateYBindings(bindings);
			updateYAssets(assets);
		});
	};

	const updateYShapes = (shapes: Record<string, TDShape | undefined>) => {
		Object.entries(shapes).forEach(([id, shape]) => {
			if (!shape) {
				yShapes.delete(id);
			} else {
				yShapes.set(shape.id, shape);
			}
		});
	};

	const updateYBindings = (bindings: Record<string, TDBinding | undefined>) => {
		Object.entries(bindings).forEach(([id, binding]) => {
			if (!binding) {
				yBindings.delete(id);
			} else {
				yBindings.set(binding.id, binding);
			}
		});
	};

	const updateYAssets = (assets: Record<string, TDAsset | undefined>) => {
		Object.entries(assets).forEach(([id, asset]) => {
			if (!asset) {
				yAssets.delete(id);
			} else {
				yAssets.set(asset.id, asset);
			}
		});
	};

	const onMount = useCallback(async (app: TldrawApp) => {
		try {
			await app.loadRoom(roomId);
			app.pause();
			setAppInstance(app);

			app.openProject = async () => {
				try {
					const result = await openFromFileSystem();
					if (!result || result === null) {
						throw new Error('Failed to open project');
					}

					const { document } = result;

					yShapes.clear();
					yBindings.clear();
					yAssets.clear();

					updateYMapsInTransaction(
						document.pages.page.shapes,
						document.pages.page.bindings,
						document.assets,
					);

					app.zoomToFit();
				} catch (error: any) {
					errorLogger('Error opening project', error);
				}
			};
		} catch (error: any) {
			errorLogger('Error loading room', error);
		}
	}, []);

	const onChangePage = useCallback(
		(
			app: TldrawApp,
			shapes: Record<string, TDShape | undefined>,
			bindings: Record<string, TDBinding | undefined>,
			assets: Record<string, TDAsset | undefined>,
		) => {
			updateYMapsInTransaction(shapes, bindings, assets);
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

		const handleDisconnect = () => provider.disconnect();

		window.addEventListener('beforeunload', handleDisconnect);

		const handleChanges = () =>
			appInstance?.replacePageContent(
				Object.fromEntries(yShapes.entries()),
				Object.fromEntries(yBindings.entries()),
				Object.fromEntries(yAssets.entries()),
			);

		const setup = async () => {
			yShapes.observeDeep(handleChanges);
			handleChanges();
			setLoading(false);
		};

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
