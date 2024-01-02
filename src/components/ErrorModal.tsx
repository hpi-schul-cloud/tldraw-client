import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { WsCloseCodeEnum } from '../enums/wsCloseCodeEnum';
import { provider } from '../store/store';

const ErrorModal = () => {
	const [infoModal, setInfoModal] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleClose = () => {
		setInfoModal(false);
	};

	useEffect(() => {
		const handleWsClose = (event: CloseEvent) => {
			if (event.code === WsCloseCodeEnum.WS_CLIENT_BAD_REQUEST_CODE) {
				setErrorMessage(
					'Document name is mandatory in URL or Tldraw Tool is turned off.',
				);
				setInfoModal(true);
			} else if (
				event.code === WsCloseCodeEnum.WS_CLIENT_UNAUTHORISED_CONNECTION_CODE
			) {
				setErrorMessage(
					"Unauthorised connection - you don't have permission to this drawing.",
				);
				setInfoModal(true);
			} else if (
				event.code === WsCloseCodeEnum.WS_CLIENT_ESTABLISHING_CONNECTION_CODE
			) {
				setErrorMessage('Unable to establish websocket connection.');
				setInfoModal(true);
			} else {
				setErrorMessage(null);
				setInfoModal(false);
			}
		};

		provider.ws?.addEventListener('close', handleWsClose);

		return () => {
			provider.ws?.removeEventListener('close', handleWsClose);
		};
	}, []);

	return (
		<Modal show={infoModal} onHide={handleClose} centered>
			<Modal.Header closeButton>
				<Modal.Title>Error</Modal.Title>
			</Modal.Header>
			<Modal.Body>{errorMessage || 'Unknown error occurred.'}</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ErrorModal;
