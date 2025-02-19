import { TDAsset, TDDocument, TDFile } from "@tldraw/tldraw";
import { fileOpen } from "browser-fs-access";
import { toast } from "react-toastify";
import { API } from "../configuration/api/api.configuration";

const openFromFileSystem = async (): Promise<null | {
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

const importAssetsToS3 = async (
  document: TDDocument,
  parentId: string,
  schoolId: string,
): Promise<void> => {
  const assets = Object.values(document.assets);
  const blobActions = assets.map(async (asset) =>
    base64ToBlobAction(asset.src),
  );
  const blobsForUpload = await Promise.all(blobActions);

  const uploadActions = blobsForUpload.map((blob, index) =>
    uploadAction(blob, parentId, schoolId, assets[index]),
  );
  const uploadBlobResults = await Promise.all(uploadActions);

  uploadBlobResults.forEach((uploadBlobResult, index) => {
    assets[index].src = uploadBlobResult.url;
  });
};

const base64ToBlobAction = (base64: string): Promise<Blob> => {
  const promise = fetch(base64).then((res) => res.blob());

  return promise;
};

const uploadAction = (
  blob: Blob,
  parentId: string,
  schoolId: string,
  asset: TDAsset,
): Promise<{ url: string }> => {
  // needed because of a tldraw bug in the TDAsset type
  // property is defined as fileName but is actually stored as name
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const extension = asset.name.split(".").pop();
  const fileToUpload = new File([blob], `${asset.id}.${extension}`, {
    type: blob.type,
  });
  const formData = new FormData();
  formData.append("file", fileToUpload);

  const fileUploadUrl = API.FILE_UPLOAD.replace("SCHOOLID", schoolId).replace(
    "CONTEXTID",
    parentId,
  );
  const promise = fetch(fileUploadUrl, {
    method: "POST",
    body: formData,
  }).then((res) => res.json());

  return promise;
};

export { openFromFileSystem, importAssetsToS3 };
