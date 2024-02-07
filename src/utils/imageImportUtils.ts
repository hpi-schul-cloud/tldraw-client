import { TDDocument, TDFile } from "@tldraw/tldraw";
import { fileOpen } from "browser-fs-access";
import { toast } from "react-toastify";
import { user } from "../stores/setup";

export const openFromFileSystem = async (): Promise<null | {
  fileHandle: FileSystemFileHandle | null;
  document: TDDocument;
}> => {
  // Get the blob
  const blob = await fileOpen({
    description: "Tldraw File",
    extensions: [".tldr"],
    multiple: false,
  });

  if (!blob) return null;

  // Get JSON from blob
  const json: string = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState === FileReader.DONE) {
        resolve(reader.result as string);
      }
    };
    reader.readAsText(blob, "utf8");
  });

  // Parse
  const file: TDFile = JSON.parse(json);
  if ("tldrawFileFormatVersion" in file) {
    console.error(
      "This file was created in a newer version of tldraw and it cannot be opened",
    );
    toast.info(
      "This file was created in a newer version of tldraw and it cannot be opened",
    );
    return null;
  }

  const fileHandle = blob.handle ?? null;

  return {
    fileHandle,
    document: file.document,
  };
};

export const base64ToFile = (base64: string, name: string): File => {
  const byteString = atob(base64.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], name, { type: "image/png" });
};

export const importAssetsToS3 = async (
  document: TDDocument,
  roomId: string,
): Promise<void> => {
  const assetsForUpload: Promise<Response>[] = [];

  Object.values(document.assets).forEach((asset) => {
    const fileToUpload = base64ToFile(asset.src, asset.fileName);

    const formData = new FormData();
    formData.append("file", fileToUpload);

    const blobUploadPromise = fetch(
      `/api/v3/file/upload/${user!.schoolId}/boardnodes/${roomId}`,
      {
        method: "POST",
        body: formData,
      },
    );
    assetsForUpload.push(blobUploadPromise);
  });

  const filesUploadedResponses = await Promise.allSettled(assetsForUpload);

  filesUploadedResponses.forEach((uploadedFileResponse) => {
    if (uploadedFileResponse.status === "rejected") {
      //todo: error handling
      console.log("USUN REFERENCJE");
    }
  });
};
