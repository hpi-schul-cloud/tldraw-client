import { Tldraw, useFileSystem } from '@tldraw/tldraw';
import { useUsers } from 'y-presence';
import './App.css';
import { awareness } from './store/store';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';

function Editor() {
	const fileSystemEvents = useFileSystem();

	return <Tldraw autofocus showPages={false} {...fileSystemEvents} />;
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
					<Editor />
				</div>
			) : null}
		</div>
	);
}
