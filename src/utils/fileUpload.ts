import { API } from "../configuration/api/api.configuration";

export const uploadFileToStorage = async (
  file: File,
  fileExtension: string,
  assetId: string,
  schoolId: string,
  roomId: string,
): Promise<string> => {
  const fileToUpload = new File([file], `${assetId}.${fileExtension}`, {
    type: file.type,
  });

  const formData = new FormData();
  formData.append("file", fileToUpload);
  const fileUploadUrl = API.FILE_UPLOAD.replace("SCHOOLID", schoolId).replace(
    "CONTEXTID",
    roomId,
  );

  const response = await fetch(fileUploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
};
