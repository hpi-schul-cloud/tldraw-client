import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { WsCloseCodeEnum } from '../enums/wsCloseCodeEnum';
import { provider } from '../store/store';

const ErrorModal: React.FC = () => {
	const [infoModal, setInfoModal] = useState(true);
	const [errorReason, setErrorReason] = useState<string | null>(null);

	const handleClose = () => {
		setInfoModal(false);
	};

	const handleRedirect = () => {
		window.location.href = `http://localhost:4000/logout`;
	};

	useEffect(() => {
		const handleWsClose = (event: CloseEvent) => {
			if (
				[
					WsCloseCodeEnum.WS_CLIENT_BAD_REQUEST_CODE,
					WsCloseCodeEnum.WS_CLIENT_UNAUTHORISED_CONNECTION_CODE,
					WsCloseCodeEnum.WS_CLIENT_ESTABLISHING_CONNECTION_CODE,
				].includes(event.code as WsCloseCodeEnum)
			) {
				setErrorReason(event.reason || 'Unknown error occurred.');
				setInfoModal(true);

				if (
					event.code === WsCloseCodeEnum.WS_CLIENT_UNAUTHORISED_CONNECTION_CODE
				) {
					setInfoModal(true);
				}
			} else {
				setInfoModal(false);
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
				{errorReason}
				{errorReason &&
					WsCloseCodeEnum.WS_CLIENT_UNAUTHORISED_CONNECTION_CODE && (
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
