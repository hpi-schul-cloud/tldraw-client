export const getRedirectUrl = (roomId: string): string => {
	if (window.location.host.startsWith('localhost')) {
		return `http://localhost:4000/login?redirect=tldraw?roomName=${roomId}`;
	} else {
		return `/login?redirect=/tldraw?roomName=${roomId}`;
	}
};
