import { useEffect } from 'react';
import { Tldraw, useFileSystem } from '@tldraw/tldraw';
import { useUsers } from 'y-presence';
import { useCookies } from 'react-cookie';
import { useMultiplayerState } from './hooks/useMultiplayerState';
import { awareness, roomID } from './store/store';
import Icon from '@mdi/react';
import { mdiAccountMultipleOutline } from '@mdi/js';
import './App.scss';

function Editor({ roomId }: { roomId: string }) {
	const { onSaveProjectAs, onSaveProject, onOpenMedia } = useFileSystem();
	const { onMount, saveUserSettings, getDarkMode, ...events } =
		useMultiplayerState(roomId);

	return (
		<Tldraw
			autofocus
			showPages={false}
			onMount={onMount}
			onPatch={saveUserSettings}
			darkMode={getDarkMode()}
			showMultiplayerMenu={false}
			{...events}
			onSaveProject={onSaveProject}
			onSaveProjectAs={onSaveProjectAs}
			onOpenMedia={onOpenMedia}
		/>
	);
}

function Info() {
	const users = useUsers(awareness);

	const hasUsers = users.size > 0;

	return (
		<div className="user-container">
			<div className="user-display">
				<div className="user-count">
					<Icon
						className="users-icon"
						path={mdiAccountMultipleOutline}
						size={1.5}
						color="#54616E"
					/>
				</div>
				{hasUsers && (
					<div className="user-indicator">
						<span className="user-indicator-span">{users.size}</span>
					</div>
				)}
			</div>
		</div>
	);
}

function App() {
	const [cookies] = useCookies(['jwt']);
	const token = cookies.jwt;

	useEffect(() => {
		if (!token) {
			window.location.href = '/login';
		}
	}, [token]);

	return (
		<div>
			{token && (
				<div className="tldraw">
					<Editor roomId={roomID} />
					<Info />
				</div>
			)}
		</div>
	);
}

export default App;
