import { Doc, Map, UndoManager } from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { TDAsset, TDBinding, TDShape } from '@tldraw/tldraw';

const defaultOptions = {
	roomName: 'GLOBAL',
	websocketUrl: 'ws://localhost:3345',
};

async function fetchTldrawServerURL() {
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
			return null;
		}

		const data = await response.json();
		return data.tldrawServerURL;
	} catch (error) {
		console.error('Error fetching tldrawServerURL:', error);
		return null;
	}
}

const tldrawServerURL = await fetchTldrawServerURL();
if (tldrawServerURL) {
	defaultOptions.websocketUrl = tldrawServerURL;
}

export const doc = new Doc();
export const urlParams = new URLSearchParams(window.location.search);
export let roomID = urlParams.get('roomName') ?? defaultOptions.roomName;
export let provider = new WebsocketProvider(
	defaultOptions.websocketUrl,
	roomID,
	doc,
	{},
);

export const awareness = provider.awareness;
export const yShapes: Map<TDShape> = doc.getMap('shapes');
export const yBindings: Map<TDBinding> = doc.getMap('bindings');
export const yAssets: Map<TDAsset> = doc.getMap('assets');
export const undoManager = new UndoManager([yShapes, yBindings, yAssets]);

export var infoModal: boolean = true;


provider.ws?.addEventListener('close', (event) => {
	if (event.code === 4400 || event.code === 4401 || event.code === 4500) {
		infoModal = true;
	}
});

export function configure(options: any) {
	Object.assign(defaultOptions, options);
	roomID = urlParams.get('roomName') ?? defaultOptions.roomName;
	provider = new WebsocketProvider(
		defaultOptions.websocketUrl,
		roomID,
		doc,
		{},
	);
}
