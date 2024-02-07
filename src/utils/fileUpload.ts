import { FILE_API_BOARDNODES, FILE_API_UPLOAD } from "../configuration/api";

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

  const response = await fetch(
    `${FILE_API_UPLOAD}${schoolId}/${FILE_API_BOARDNODES}/${roomId}`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
};
