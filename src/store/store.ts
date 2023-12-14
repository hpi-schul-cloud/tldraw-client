import { Doc, Map, UndoManager } from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { TDAsset, TDBinding, TDShape } from '@tldraw/tldraw';
import { Room } from '@y-presence/client';
import { TldrawPresence } from '../types';

const defaultOptions = {
	roomName: 'GLOBAL',
	websocketUrl: 'ws://localhost:3345',
};

(async () => {
	try {
		const response = await fetch(
			`${window.location.origin}/tldraw-client-runtime.config.json`,
		);

		if (!response.ok) {
			console.error(
				'Error fetching tldrawServerURL:',
				response.status,
				response.statusText,
			);
			return;
		}

		const data: { tldrawServerURL: string } = await response.json();
		defaultOptions.websocketUrl = data.tldrawServerURL;
	} catch (error) {
		console.error('Error fetching tldrawServerURL:', error);
	}
})();

export const doc = new Doc();
export const urlParams = new URLSearchParams(window.location.search);
export const roomID = urlParams.get('roomName') ?? defaultOptions.roomName;
export const provider = new WebsocketProvider(
	defaultOptions.websocketUrl,
	roomID,
	doc,
	{},
);

export const { awareness } = provider;
export const room = new Room<TldrawPresence>(awareness, {});
export const yShapes: Map<TDShape> = doc.getMap('shapes');
export const yBindings: Map<TDBinding> = doc.getMap('bindings');
export const yAssets: Map<TDAsset> = doc.getMap('assets');
export const undoManager = new UndoManager([yShapes, yBindings, yAssets]);
