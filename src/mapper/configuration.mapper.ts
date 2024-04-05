import { Envs } from "../types/Envs";
import { TypeGuard } from "../guards/type.guard";

const checkEnvType = (obj: Record<string, unknown>): void => {
  TypeGuard.checkKeyAndValueExists(obj, "FEATURE_TLDRAW_ENABLED");
  TypeGuard.checkKeyAndValueExists(obj, "TLDRAW__ASSETS_ENABLED");
  TypeGuard.checkKeyAndValueExists(obj, "TLDRAW__ASSETS_MAX_SIZE");
  TypeGuard.checkKeyAndValueExists(
    obj,
    "TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST",
  );
  TypeGuard.checkBoolean(obj.FEATURE_TLDRAW_ENABLED);
  TypeGuard.checkBoolean(obj.FEATURE_TLDRAW_ENABLED);
  TypeGuard.checkNumber(obj.TLDRAW__ASSETS_MAX_SIZE);
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
      FEATURE_TLDRAW_ENABLED: configuration.FEATURE_TLDRAW_ENABLED,
      TLDRAW__ASSETS_ENABLED: configuration.TLDRAW__ASSETS_ENABLED,
      TLDRAW__ASSETS_MAX_SIZE: configuration.TLDRAW__ASSETS_MAX_SIZE,
      TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST:
        configuration.TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST,
    };

    return mappedConfiguration;
  }
}
