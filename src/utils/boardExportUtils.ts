import { fileSave } from "browser-fs-access";
import { TDAsset, TDDocument, TDFile } from "@tldraw/tldraw";

const saveToFileSystem = async (
  document: TDDocument,
  fileHandle: FileSystemFileHandle | null,
  name?: string,
) => {
  const file: TDFile = {
    name: document.name || "New Document",
    fileHandle: fileHandle,
    document,
  };

  const assets = Object.values(document.assets);
  const downloadActions = assets.map((asset) =>
    createBlobDownloadAction(asset),
  );
  const blobResults = await Promise.all(downloadActions);

  const base64Actions = blobResults.map((blob) =>
    createBlobToBase64Action(blob),
  );
  const base64Results = await Promise.all(base64Actions);

  assets.forEach((asset, index) => {
    const base64result = base64Results[index];
    if (typeof base64result === "string") {
      asset.src = base64Results[index] as string;
    } else {
      throw new Error("Error converting blob to base64");
    }
  });

  // Serialize to JSON
  const json = JSON.stringify(file);

  // Create blob
  const blob = new Blob([json], {
    type: "application/vnd.Tldraw+json",
  });

  // Save to file system
  const newFileHandle = await fileSave(
    blob,
    {
      fileName: `${name}.tldr`,
      description: "Tldraw File",
      extensions: [`.tldr`],
    },
    fileHandle,
  );

  return newFileHandle;
};

const createBlobDownloadAction = async (asset: TDAsset) => {
  const promise = fetch(asset.src).then((res) => res.blob());

  return promise;
};

const createBlobToBase64Action = async (blob: Blob) => {
  const promise = fileToBase64(blob);

  return promise;
};

const fileToBase64 = (file: Blob): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.onabort = (error) => reject(error);
    }
  });
};

export { saveToFileSystem, fileToBase64 };
