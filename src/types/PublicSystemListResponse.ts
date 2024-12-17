export type OauthConfigResponse = {
  clientId: string;
  idpHint?: string;
  redirectUri: string;
  grantType: string;
  tokenEndpoint: string;
  authEndpoint: string;
  responseType: string;
  scope: string;
  provider: string;
  logoutEndpoint?: string;
  issuer: string;
  jwksEndpoint: string;
  endSessionEndpoint?: string;
};

export type PublicSystemResponse = {
  id: string;
  type: string;
  alias?: string;
  displayName?: string;
  oauthConfig?: OauthConfigResponse;
};

export type PublicSystemListResponse = {
  data: PublicSystemResponse[];
};
