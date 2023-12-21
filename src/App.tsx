import { useEffect } from 'react';
import { Tldraw, useFileSystem } from '@tldraw/tldraw';
import { useUsers } from 'y-presence';
import { useCookies } from 'react-cookie';
import { useMultiplayerState } from './hooks/useMultiplayerState';
import Icon from '@mdi/react';
import { mdiAccountMultipleOutline } from '@mdi/js';
import { awareness, roomID } from './store/store';
import ErrorModal from './components/ErrorModal';
import './App.scss';

function Editor({ roomId }: { roomId: string }) {
	const { onSaveProjectAs, onSaveProject, onOpenMedia, onOpenProject } =
		useFileSystem();
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
			onOpenProject={onOpenProject}
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
		<div className="user-display">
			<div className="user-count">
				<Icon
					className="user-icon"
					path={mdiAccountMultipleOutline}
					size={'40px'}
					color="#54616E"
				/>
			</div>
			{hasUsers && (
				<div className="user-indicator">
					<span className="user-indicator-span">{users.size}</span>
				</div>
			)}
		</div>
	);
}

function App() {
	const [cookies] = useCookies(['jwt']);
	const token = cookies.jwt;

	useEffect(() => {
		if (!token) {
			if (window.location.host.startsWith('localhost')) {
				window.location.href = `http://localhost:4000/login?redirect=tldraw?roomName=${roomID}`;
			} else {
				window.location.href = `/login?redirect=/tldraw?roomName=${roomID}`;
			}
		}
	}, [token]);

	return (
		<div>
			{token && (
				<div className="tldraw-content">
					<Info />
					<div className="tldraw">
						<Editor roomId={roomID} />
					</div>
					<ErrorModal />
				</div>
			)}
		</div>
	);
}

export default App;
