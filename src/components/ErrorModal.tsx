import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { WsCloseCodeEnum } from '../enums/wsCloseCodeEnum';
import { provider, roomID } from '../store/store';

const ErrorModal: React.FC = () => {
	const [infoModal, setInfoModal] = useState(true);
	const [errorReason, setErrorReason] = useState<string | null>(null);

	const disableModalClosing =
		infoModal &&
		(errorReason === WsCloseCodeEnum.WS_CLIENT_BAD_REQUEST_CODE.toString() ||
			errorReason ===
				WsCloseCodeEnum.WS_CLIENT_UNAUTHORISED_CONNECTION_CODE.toString());

	const handleClose = () => {
		if (disableModalClosing) {
			return;
		}
		setInfoModal(false);
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
					setTimeout(() => {
						window.location.href = `/login?redirect=tldraw?roomName=${roomID}`;
					}, 5000);
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
			<Modal.Body>{errorReason}</Modal.Body>
		</Modal>
	);
};

export default ErrorModal;
