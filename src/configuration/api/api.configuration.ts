// remove this code by BC-7906
// set ENV_CONFIG to /api/tldraw/config/public
// remove line 7 and 8 in ngnix.conf.template
import { HttpStatusCode } from "../../types/StatusCodeEnums";
import { setErrorData } from "../../utils/errorData";
import { redirectToErrorPage } from "../../utils/redirectUtils";

const getConfigOptions = async (): Promise<{
  SERVER_TLDRAW_2_ENABLED: boolean;
}> => {
  const connectionOptions = {
    SERVER_TLDRAW_2_ENABLED: !!import.meta.env.VITE_SERVER_TLDRAW_2_ENABLED,
  };

  if (import.meta.env.PROD) {
    try {
      const response = await fetch("/tldraw-client-runtime.config.json");

      if (!response.ok) {
        throw new Error(`${response.status} - ${response.statusText}`);
      }

      const data: { SERVER_TLDRAW_2_ENABLED: string } = await response.json();
      connectionOptions.SERVER_TLDRAW_2_ENABLED =
        data.SERVER_TLDRAW_2_ENABLED.toLowerCase() === "true";
    } catch (error) {
      setErrorData(HttpStatusCode.InternalServerError, "error.500");
      redirectToErrorPage();
    }
  }

  return connectionOptions;
};

const configApiUrl = async () => {
  const configApiUrl = (await getConfigOptions()).SERVER_TLDRAW_2_ENABLED
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
  ENV_CONFIG: await configApiUrl(),
};
