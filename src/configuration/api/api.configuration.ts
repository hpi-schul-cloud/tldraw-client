// remove this code by BC-7906
// set CONFIG_PATH to /api/tldraw/config/public
// remove line 7 and 8 in ngnix.conf.template
import { HttpStatusCode } from "../../types/StatusCodeEnums";
import { setErrorData } from "../../utils/errorData";
import { redirectToErrorPage } from "../../utils/redirectUtils";

const getConfigOptions = async (): Promise<{
  CONFIG_PATH: string;
}> => {
  const connectionOptions = {
    CONFIG_PATH: configApiUrl(),
  };

  if (import.meta.env.PROD) {
    try {
      const response = await fetch("/tldraw-client-runtime.config.json");

      if (!response.ok) {
        throw new Error(`${response.status} - ${response.statusText}`);
      }

      const data: { CONFIG_PATH: string } = await response.json();
      connectionOptions.CONFIG_PATH = data.CONFIG_PATH;
    } catch (error) {
      setErrorData(HttpStatusCode.InternalServerError, "error.500");
      redirectToErrorPage();
    }
  }

  return connectionOptions;
};

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
  CONFIG_PATH: await getConfigOptions().then((options) => options.CONFIG_PATH),
};
