const configApiUrl = () => {
  const configApiUrl = import.meta.env.VITE_SERVER_TLDRAW_2_ENABLED
    ? `/api/tldraw/config/public`
    : `/api/v3/config/public`;

  return configApiUrl;
};
export const API = {
  FILE_UPLOAD: "/api/v3/file/upload/school/SCHOOLID/boardnodes/CONTEXTID",
  FILE_DELETE: "/api/v3/file/delete/FILERECORD_ID",
  FILE_RESTORE: "/api/v3/file/restore/FILERECORD_ID",
  LOGIN_REDIRECT: "/login?redirect=/tldraw?parentId=PARENTID",
  USER_DATA: `/api/v3/user/me`,
  ENV_CONFIG: configApiUrl(),
};
