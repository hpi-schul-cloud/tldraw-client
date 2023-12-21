import { provider } from '../store/store';
import { WsCloseCodeEnum } from '../enums/wsCloseCodeEnum';

export let infoModal: boolean = true;
export let errorMessage: string | null = null;

provider.ws?.addEventListener('close', (event) => {
	infoModal = true;

	switch (event.code) {
		case WsCloseCodeEnum.WS_CLIENT_BAD_REQUEST_CODE:
			errorMessage =
				'Document name is mandatory in URL or Tldraw Tool is turned off.';
			break;
		case WsCloseCodeEnum.WS_CLIENT_UNAUTHORISED_CONNECTION_CODE:
			errorMessage =
				"Unauthorised connection - you don't have permission to this drawing.";
			break;
		case WsCloseCodeEnum.WS_CLIENT_ESTABLISHING_CONNECTION_CODE:
			errorMessage = 'Unable to establish websocket connection.';
			break;
		default:
			errorMessage = null;
			break;
	}
});
