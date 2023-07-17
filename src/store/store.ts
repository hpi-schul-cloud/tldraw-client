import { Doc, Map, UndoManager } from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { TDBinding, TDShape } from '@tldraw/tldraw';

export const doc = new Doc();
export const urlParams = new URLSearchParams(window.location.search);
export const roomID = urlParams.get('roomName') ?? 'GLOBAL';
export const provider = new WebsocketProvider(`ws://localhost:3345`, roomID, doc, {});
export const awareness = provider.awareness;
export const yShapes: Map<TDShape> = doc.getMap('shapes');
export const yBindings: Map<TDBinding> = doc.getMap('bindings');
export const undoManager = new UndoManager([yShapes, yBindings]);
