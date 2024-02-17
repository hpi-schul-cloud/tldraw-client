import { Envs } from "../types";
import { TypeGuard } from "../guards";

const castToEnvs = (json: Record<string, unknown>): Envs => {
	TypeGuard.checkKeyAndValueExists(json, 'FEATURE_TLDRAW_ENABLED');
	TypeGuard.checkKeyAndValueExists(json, 'TLDRAW__ASSETS_ENABLED');
	TypeGuard.checkKeyAndValueExists(json, 'TLDRAW__ASSETS_MAX_SIZE');
	TypeGuard.checkKeyAndValueExists(json, 'TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST');
	TypeGuard.checkBoolean(json.FEATURE_TLDRAW_ENABLED);
	TypeGuard.checkBoolean(json.FEATURE_TLDRAW_ENABLED);
	TypeGuard.checkNumber(json.TLDRAW__ASSETS_MAX_SIZE);
	TypeGuard.checkString(json.TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST);

	const configuration = json as Envs;

	return configuration;
}

export class ConfigurationMapper {
    static mapToConfigurationFromResponse(json: Record<string, unknown>): Envs {
		const configuration = castToEnvs(json);

		const mappedConfiguration: Envs = {
			FEATURE_TLDRAW_ENABLED: configuration.FEATURE_TLDRAW_ENABLED,
			TLDRAW__ASSETS_ENABLED: configuration.TLDRAW__ASSETS_ENABLED,
			TLDRAW__ASSETS_MAX_SIZE: configuration.TLDRAW__ASSETS_MAX_SIZE,
			TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST: configuration.TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST,
		}

		return mappedConfiguration;
    }
}