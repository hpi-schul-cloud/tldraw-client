import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { errorMessage, infoModal } from '../utilities/webSocketUtils';

const ErrorModal = () => {
	const [show, setShow] = useState(infoModal);

	const handleClose = () => {
		setShow(false);
	};

	useEffect(() => {
		setShow(infoModal);
	}, [infoModal]);

	return (
		<Modal show={show} onHide={handleClose}>
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
