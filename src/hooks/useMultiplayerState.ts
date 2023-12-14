import {
	TDAsset,
	TDBinding,
	TDShape,
	TDUser,
	TldrawApp,
	TldrawPatch,
} from '@tldraw/tldraw';
import { useCallback, useEffect, useState } from 'react';
import {
	doc,
	provider,
	room,
	undoManager,
	yAssets,
	yBindings,
	yShapes,
} from '../store/store';
import {
	getUserSettings,
	setDefaultState,
	STORAGE_SETTINGS_KEY,
} from '../utils/userSettings';

export function useMultiplayerState(roomId: string) {
	const [appInstance, setAppInstance] = useState<TldrawApp | undefined>(
		undefined,
	);
	const [loading, setLoading] = useState<boolean>(true);

	setDefaultState();

	const getDarkMode = (): boolean | undefined => {
		const settings = getUserSettings();

		// returning undefined means that the system default will be used
		return settings ? settings.isDarkMode : undefined;
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

	const onMount = useCallback(
		(app: TldrawApp) => {
			app.loadRoom(roomId);
			app.pause();
			setAppInstance(app);
		},
		[roomId],
	);

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

	const onChangePresence = useCallback((app: TldrawApp, user: TDUser) => {
		if (!app.room) return;
		room.setPresence({ id: app.room.userId, tdUser: user });
	}, []);

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
