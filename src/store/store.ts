import * as Y from 'yjs'
import { TDBinding, TDShape } from '@tldraw/tldraw'
import { WebsocketProvider } from 'y-websocket';

export const doc = new Y.Doc()
export const urlParams = new URLSearchParams(window.location.search);
export const roomID = urlParams.get('roomName') ?? 'GLOBAL';
export const provider = new WebsocketProvider(`ws://localhost:3345`, roomID, doc, {
    connect: true
  })
export const awareness = provider.awareness;
export const yShapes: Y.Map<TDShape> = doc.getMap('shapes')
export const yBindings: Y.Map<TDBinding> = doc.getMap('bindings')
export const undoManager = new Y.UndoManager([yShapes, yBindings])
