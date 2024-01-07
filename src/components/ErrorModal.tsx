import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useWebsocketErrorHandler } from "../hooks/useWebsocketErrorHandler";

function ErrorModal() {
  const {
    infoModal,
    errorMessage,
    showRedirectButton,
    handleRedirect,
    handleClose,
  } = useWebsocketErrorHandler();

  return (
    <Modal show={infoModal} onHide={handleClose} centered backdrop="static">
      <Modal.Header>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage}
        {showRedirectButton && (
          <Modal.Footer className={"mt-3"}>
            <Button variant="secondary" onClick={handleRedirect}>
              Login
            </Button>
          </Modal.Footer>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ErrorModal;
