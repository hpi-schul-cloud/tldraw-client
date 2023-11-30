import { useEffect } from 'react';
import { Tldraw, useFileSystem } from '@tldraw/tldraw';
import { useUsers } from 'y-presence';
import { useCookies } from 'react-cookie';
import { useMultiplayerState } from './hooks/useMultiplayerState';
import { awareness, roomID } from './store/store';
import './App.css';

function Editor({ roomId }: { roomId: string }) {
	const { onSaveProjectAs, onSaveProject, onOpenMedia, onOpenProject } =
		useFileSystem();
	const { onMount, saveUserSettings, getDarkMode, ...events } =
		useMultiplayerState(roomId);

	// useEffect(() => {
	// 	setTimeout(() => {
	// 		const regex = /\bTD-Link-\w+\b/;

	// 		const buttons = document.querySelectorAll('button');
	// 		buttons.forEach((button) => {
	// 			if (regex.test(button.id)) {
	// 				button.style.display = 'none';
	// 			}
	// 		});
	// 	}, 2000);
	// }, []);

	return (
		<Tldraw
			autofocus
			showPages={false}
			onMount={onMount}
			onPatch={saveUserSettings}
			darkMode={getDarkMode()}
			showMultiplayerMenu={false}
			{...events}
			onOpenProject={onOpenProject}
			onSaveProject={onSaveProject}
			onSaveProjectAs={onSaveProjectAs}
			onOpenMedia={onOpenMedia}
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

function App() {
	const [cookies] = useCookies(['jwt']);
	const token = cookies.jwt;

	// useEffect(() => {
	// 	if (!token) {
	// 		window.location.href = '/login';
	// 	}
	// }, [token]);

	return (
		<div>
			<div className="tldraw">
				<Info />
				<Editor roomId={roomID} />
			</div>
		</div>
	);
}

export default App;
