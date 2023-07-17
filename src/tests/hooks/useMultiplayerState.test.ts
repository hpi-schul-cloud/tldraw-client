import { ShapeStyles, TDShape, TDUser } from '@tldraw/tldraw';
import { TldrawApp } from '@tldraw/tldraw';
import { room, useMultiplayerState } from '../../hooks/useMultiplayerState';
import { undoManager, yBindings, yShapes } from '../../store/store';
import React from 'react';

describe('useMultiplayerState', () => {
	jest.mock('y-websocket');
	jest.mock('@tldraw/tldraw');
	jest.mock('@y-presence/client');
	jest.spyOn(React, 'useCallback').mockImplementation((callback) => callback);

	const setStateMock = jest.fn();
	const useStateMock: any = (useState: any) => [useState, setStateMock];
	jest.spyOn(React, 'useState').mockImplementation(useStateMock);

	jest.spyOn(React, 'useEffect').mockImplementation((f) => f());

	describe('onUndo', () => {
		it('should call undoManager.undo function', () => {
			const spy = jest.spyOn(undoManager, 'undo').mockImplementation(() => null);
			useMultiplayerState('1').onUndo();
			expect(spy).toHaveBeenCalledTimes(1);
		});
	}),
		describe('onRedo', () => {
			it('should call undoManager.redo function', () => {
				const spy = jest.spyOn(undoManager, 'redo').mockImplementation(() => null);
				useMultiplayerState('1').onRedo();
				expect(spy).toHaveBeenCalledTimes(1);
			});
		});

	describe('onChangePresence', () => {
		it('should not call room.setPresence if there is no room', () => {
			const spy = jest.spyOn(room, 'setPresence').mockImplementation(() => null);

			useMultiplayerState('1').onChangePresence({} as TldrawApp, {} as TDUser);

			expect(spy).not.toHaveBeenCalled();
		});

		it('should call room.setPresence with the correct arguments', () => {
			const spy = jest.spyOn(room, 'setPresence').mockImplementation(() => null);

			useMultiplayerState('1').onChangePresence({ room: { userId: '123' } } as TldrawApp, {} as TDUser);

			expect(spy).toHaveBeenCalledWith({ id: '123', tdUser: {} });
		});
	});
	describe('onMount', () => {
		it('should call loadRoom, pause and setApp(app) methods', () => {
			const tldrawApp = new TldrawApp('1');

			const loadRoomSpy = jest.spyOn(tldrawApp, 'loadRoom').mockImplementation(() => ({}) as TldrawApp);

			const pauseSpy = jest.spyOn(tldrawApp, 'pause').mockImplementation(() => null);

			const setAppSpy = jest.fn();
			jest.spyOn(React, 'useState').mockImplementation(() => [null, setAppSpy]);

			const { onMount } = useMultiplayerState('1');

			onMount(tldrawApp);
			expect(loadRoomSpy).toHaveBeenCalledWith('1');
			expect(pauseSpy).toHaveBeenCalled();
			expect(setAppSpy).toHaveBeenCalledWith(tldrawApp);
		});
	});

	describe('onChangePage', () => {
		it('should delete shapes and bindings if they are falsy', () => {
			const tldrawApp = new TldrawApp('1');
			const shapes = {
				shape1: undefined,
			};
			const bindings = {
				binding1: undefined,
			};

			const deleteShapeSpy = jest.spyOn(yShapes, 'delete');
			const deleteBindingSpy = jest.spyOn(yBindings, 'delete');
			const spyUndoManager = jest.spyOn(undoManager, 'stopCapturing');

			const { onChangePage } = useMultiplayerState('1');

			onChangePage(tldrawApp, shapes, bindings);

			expect(deleteShapeSpy).toHaveBeenCalledWith('shape1');

			expect(deleteBindingSpy).toHaveBeenCalledWith('binding1');

			expect(undoManager.stopCapturing).toHaveBeenCalledTimes(1);
		});

		it('should set shapes add them if they are truthy', () => {
			const tldrawApp = new TldrawApp('1');
			const shapes: Record<string, TDShape | undefined> = {
				test: {
					id: 'test',
					style: {} as ShapeStyles,
				} as TDShape,
			};
			const bindings: Record<string, TDShape | undefined> = {
				test: {
					id: 'test',
					style: {} as ShapeStyles,
				} as TDShape,
			};

			const setShapeSpy = jest.spyOn(yShapes, 'set');
			const setBindingSpy = jest.spyOn(yBindings, 'set');

			const { onChangePage } = useMultiplayerState('1');

			onChangePage(tldrawApp, shapes, bindings as any);
			expect(setShapeSpy).toHaveBeenCalledWith('test', shapes.test);
			expect(setBindingSpy).toHaveBeenCalledWith('test', bindings.test);
		});
	});
});
