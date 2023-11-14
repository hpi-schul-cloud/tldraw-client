import { Tldraw, useFileSystem } from '@tldraw/tldraw';
import { useUsers } from 'y-presence';
import './App.css';
import { awareness, roomID } from './store/store';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useMultiplayerState } from './hooks/useMultiplayerState';

function Editor({ roomId }: { roomId: string }) {
	const fileSystemEvents = useFileSystem();
	const {
		onMount,
		// onAssetCreate,
		// onAssetDelete,
		saveUserSettings,
		getDarkMode,
		...events
	} = useMultiplayerState(roomId);

	return (
		<Tldraw
			autofocus
			showPages={false}
			onMount={onMount}
			onPatch={saveUserSettings}
			darkMode={getDarkMode()}
			// onAssetCreate={onAssetCreate}
			// onAssetDelete={onAssetDelete}
			{...fileSystemEvents}
			{...events}
		/>
	);
}

function Info() {
	const users = useUsers(awareness);

	return (
		<div className="user-container">
			<div className="flex space-between">
				<span>Number of connected users: {users.size}</span>
			</div>
		</div>
	);
}

export default function App() {
	const [cookies] = useCookies(['jwt']);
	const token = cookies.jwt;

	useEffect(() => {
		if (!token) {
			window.location.href = '/login';
		}
	}, []);
	return (
		<div>
			{token ? (
				<div className="tldraw">
					<Info />
					<Editor roomId={roomID} />
				</div>
			) : null}
		</div>
	);
}
