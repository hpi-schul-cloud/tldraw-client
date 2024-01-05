import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { WsCloseCodeEnum } from '../enums/wsCloseCodeEnum';
import { provider, roomID } from '../store/store';

const ErrorModal: React.FC = () => {
	const [infoModal, setInfoModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [showLoginButton, setShowLoginButton] = useState(false);

	const handleClose = () => {
		setInfoModal(false);
	};

	const handleRedirect = () => {
		window.location.href = `/login?redirect=tldraw?roomName=${roomID}`;
	};

	useEffect(() => {
		const handleWsClose = (event: CloseEvent) => {
			const {
				WS_CLIENT_BAD_REQUEST_CODE,
				WS_CLIENT_UNAUTHORISED_CONNECTION_CODE,
				WS_CLIENT_ESTABLISHING_CONNECTION_CODE,
				WS_CLIENT_NOT_FOUND_CODE,
			} = WsCloseCodeEnum;

			const errorMessages = {
				[WS_CLIENT_BAD_REQUEST_CODE]:
					'Document name is mandatory in URL or Tldraw Tool is turned off.',
				[WS_CLIENT_UNAUTHORISED_CONNECTION_CODE]:
					"Unauthorised connection - you don't have permission to this drawing. Try again later.",
				[WS_CLIENT_ESTABLISHING_CONNECTION_CODE]:
					'Unable to establish websocket connection. Try again later.',
				[WS_CLIENT_NOT_FOUND_CODE]: 'Drawing not found.',
			};

			const code = event.code as WsCloseCodeEnum;
			if (
				code === WS_CLIENT_BAD_REQUEST_CODE ||
				code === WS_CLIENT_UNAUTHORISED_CONNECTION_CODE ||
				code === WS_CLIENT_ESTABLISHING_CONNECTION_CODE ||
				code === WS_CLIENT_NOT_FOUND_CODE
			) {
				setErrorMessage(errorMessages[code] || 'Unknown error occurred.');
				setShowLoginButton(code === WS_CLIENT_UNAUTHORISED_CONNECTION_CODE);
				setInfoModal(true);
			}
		};

		provider.ws?.addEventListener('close', handleWsClose);

		return () => {
			provider.ws?.removeEventListener('close', handleWsClose);
		};
	}, []);

	return (
		<Modal show={infoModal} onHide={handleClose} centered backdrop="static">
			<Modal.Header>
				<Modal.Title>Error</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{errorMessage}
				{showLoginButton && (
					<Modal.Footer>
						<Button variant="secondary" onClick={handleRedirect}>
							Go to Login page
						</Button>
					</Modal.Footer>
				)}
			</Modal.Body>
		</Modal>
	);
};

export default ErrorModal;
