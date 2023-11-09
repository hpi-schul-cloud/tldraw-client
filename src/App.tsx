import { Tldraw, useFileSystem } from '@tldraw/tldraw';
import { useUsers } from 'y-presence';
import './App.css';
import { awareness, roomID } from './store/store';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useMultiplayerState } from './hooks/useMultiplayerState';

function Editor({ id, roomId }: { id: string; roomId: string }) {
	const fileSystemEvents = useFileSystem();
	const { onMount, ...events } = useMultiplayerState(roomId);

	return (
		<Tldraw
			id={id}
			autofocus
			showPages={false}
			onMount={onMount}
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
					<Editor id="home" roomId={roomID} />
				</div>
			) : null}
		</div>
	);
}
