export type Envs = {
  FEATURE_TLDRAW_ENABLED: boolean;
  TLDRAW__ASSETS_ENABLED: boolean;
  TLDRAW__ASSETS_MAX_SIZE: number;
  TLDRAW__ASSETS_ALLOWED_EXTENSIONS_LIST: string;
};

export interface EnvsResponse {
  code: number;
  envs: Envs | undefined;
}
