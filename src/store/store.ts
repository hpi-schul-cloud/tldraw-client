import { Doc, Map, UndoManager } from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { TDBinding, TDShape } from '@tldraw/tldraw';

export function setCookies(name: string, value: string, path: string) {
	document.cookie = `${name}=${value}; path=${path}`;
}

export function setTldrawBoardNameCookie(roomName: string) {
	setCookies('SERVERID', roomName, '/');
	setCookies('SERVERID', roomName, '/tldraw');
	setCookies('SERVERID', roomName, '/static');
}

const defaultOptions = {
	roomName: 'GLOBAL',
	websocketUrl: 'ws://localhost:3345',
};

async function fetchTldrawServerURL() {
	try {
		const response = await fetch(
			`${window.location.origin}/tldraw-client-runtime.config.json`,
		);
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
export const undoManager = new UndoManager([yShapes, yBindings]);

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

setTldrawBoardNameCookie(roomID);
