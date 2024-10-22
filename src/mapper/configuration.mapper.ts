import { TypeGuard } from "../guards/type.guard";
import { Envs } from "../types/Envs";

const checkEnvType = (obj: Record<string, unknown>): void => {
  TypeGuard.checkKeyAndValueExists(obj, "TLDRAW__WEBSOCKET_URL");
  TypeGuard.checkKeyAndValueExists(obj, "FEATURE_TLDRAW_ENABLED");
  TypeGuard.checkKeyAndValueExists(obj, "TLDRAW__ASSETS_ENABLED");
  TypeGuard.checkKeyAndValueExists(obj, "TLDRAW__ASSETS_MAX_SIZE_BYTES");
  TypeGuard.checkKeyAndValueExists(
    obj,
    "TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST",
  );
  TypeGuard.checkBoolean(obj.FEATURE_TLDRAW_ENABLED);
  TypeGuard.checkNumber(obj.TLDRAW__ASSETS_MAX_SIZE_BYTES);
  TypeGuard.checkArray(obj.TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST);
};

const castToEnv = (obj: Record<string, unknown>): Envs => {
  checkEnvType(obj);
  const configuration = obj as Envs;

  return configuration;
};

export class ConfigurationMapper {
  static mapToConfigurationFromResponse(obj: Record<string, unknown>): Envs {
    const configuration = castToEnv(obj);

    const mappedConfiguration: Envs = {
      TLDRAW__WEBSOCKET_URL: configuration.TLDRAW__WEBSOCKET_URL,
      FEATURE_TLDRAW_ENABLED: configuration.FEATURE_TLDRAW_ENABLED,
      TLDRAW__ASSETS_ENABLED: configuration.TLDRAW__ASSETS_ENABLED,
      TLDRAW__ASSETS_MAX_SIZE_BYTES:
        configuration.TLDRAW__ASSETS_MAX_SIZE_BYTES,
      TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST:
        configuration.TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST,
    };

    return mappedConfiguration;
  }
}
