export const API = {
  FILE_UPLOAD: "/api/v3/file/upload/school/SCHOOLID/boardnodes/CONTEXTID",
  FILE_DELETE: "/api/v3/file/delete/FILERECORD_ID",
  FILE_RESTORE: "/api/v3/file/restore/FILERECORD_ID",
  LOGIN_REDIRECT: "/login?redirect=/tldraw?parentId=PARENT_ID",
  SYSTEMS_PUBLIC: "/api/v3/systems/public?types=oauth&oidc",
  TSP_LOGIN_REDIRECT: "/login/oauth2/SYSTEM_ID",
  USER_DATA: `/api/v3/user/me`,
  CONFIG_PATH: `/api/tldraw/config/public`,
};
