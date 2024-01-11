import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useErrorHandler } from "../hooks/useErrorHandler";

function ErrorModal() {
  const {
    showModal,
    showRedirectButton,
    errorTitle,
    errorMessage,
    handleRedirect,
    handleClose,
  } = useErrorHandler();

  return (
    <Modal show={showModal} onHide={handleClose} centered backdrop="static">
      <Modal.Header>
        <Modal.Title>{errorTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{errorMessage}</Modal.Body>
      {showRedirectButton && (
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRedirect}>
            Login
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}

export default ErrorModal;
