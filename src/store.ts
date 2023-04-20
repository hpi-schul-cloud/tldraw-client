import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { TDBinding, TDShape } from '@tldraw/tldraw'

export const doc = new Y.Doc()
export const urlParams = new URLSearchParams(window.location.search);
export const roomID = urlParams.get('room_name') ?? 'GLOBAL';
export const provider = new WebsocketProvider(`ws://localhost:3333/tldraw-server`, roomID, doc)
export const awareness = provider.awareness
export const yShapes: Y.Map<TDShape> = doc.getMap('shapes')
export const yBindings: Y.Map<TDBinding> = doc.getMap('bindings')
export const undoManager = new Y.UndoManager([yShapes, yBindings])
