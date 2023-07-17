import { Doc, Map, UndoManager } from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { TDBinding, TDShape } from '@tldraw/tldraw';

const defaultOptions = {
	roomName: 'GLOBAL',
	websocketUrl: 'ws://localhost:3345',
};

export const doc = new Doc();
export const urlParams = new URLSearchParams(window.location.search);
export let roomID = urlParams.get('roomName') ?? defaultOptions.roomName;
export let provider = new WebsocketProvider(defaultOptions.websocketUrl, roomID, doc, {});
export const awareness = provider.awareness;
export const yShapes: Map<TDShape> = doc.getMap('shapes');
export const yBindings: Map<TDBinding> = doc.getMap('bindings');
export const undoManager = new UndoManager([yShapes, yBindings]);

export function configure(options: any) {
	Object.assign(defaultOptions, options);
	roomID = urlParams.get('roomName') ?? defaultOptions.roomName;
	provider = new WebsocketProvider(defaultOptions.websocketUrl, roomID, doc, {});
}
