import { TDAsset, TDDocument, TDFile } from "@tldraw/tldraw";
import { fileOpen } from "browser-fs-access";
import { toast } from "react-toastify";
import { TldrawApp } from "@tldraw/tldraw";
import { Utils } from "@tldraw/core";
import { API } from "../configuration/api/api.configuration";
import { envs } from "../stores/setup";
import { fileMimeExtensions } from "../types/fileExtensions";

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
  roomId: string,
  schoolId: string,
): Promise<void> => {
  const assets = Object.values(document.assets);
  const blobActions = assets.map(async (asset) =>
    base64ToBlobAction(asset.src),
  );
  const blobsForUpload = await Promise.all(blobActions);

  const uploadActions = blobsForUpload.map((blob, index) =>
    uploadAction(blob, roomId, schoolId, assets[index]),
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
  roomId: string,
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
    roomId,
  );
  const promise = fetch(fileUploadUrl, {
    method: "POST",
    body: formData,
  }).then((res) => res.json());

  return promise;
};

const allowedMimeTypes = envs?.TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST || [];

const openAssetsFromFileSystem = async () => {
  const extensions = allowedMimeTypes.flatMap(
    (mimeType) => fileMimeExtensions[mimeType] || [],
  );
  // NOTE: The extensions here are selected based on the MIME types allowed by TLDRAW,
  //       taking into account additional extension checks performed internally by TLDRAW.

  const result = await fileOpen({
    description: "Image",
    extensions: extensions,
    multiple: true,
  });

  return result;
};

const addMediaFromFiles = async (files: File[], point = app.centerPoint) => {
  app.setIsLoading(false);
  // Rather than creating each shape individually (which will produce undo / redo entries
  // for each shape), create an array of all the shapes that we'll need to create. We'll
  // iterate through these at the bottom of the function to set their points, then create
  // them through a single call to `createShapes`.

  const shapesToCreate: TDShape[] = [];
  const pagePoint = app.getPagePoint(point);

  for (const file of files) {
    try {
      const shape = await createShapeFromMedia(file, app, pagePoint);
      if (shape) shapesToCreate.push(shape);
    } catch (error) {
      console.warn(error);
    }
  }

  if (shapesToCreate.length) {
    const bounds = Utils.getCommonBounds(
      shapesToCreate.map((shape) => TLDR.getBounds(shape)),
    );

    adjustShapesPosition(shapesToCreate, bounds);

    app.createShapes(...shapesToCreate);

    if (!Utils.boundsContain(app.viewport, bounds)) {
      app.zoomToSelection();
      if (app.zoom > 1) app.resetZoom();
    }
  }

  app.setIsLoading(false);
};

const createShapeFromMedia = async (
  file: File,
  app: TldrawApp,
  pagePoint: number[],
): Promise<TDShape | null> => {
  const id = Utils.uniqueId();
  const extension = getFileExtension(file.name);

  if (!extension) throw new Error("No extension");

  const mimeTypes = Object.keys(fileMimeExtensions);
  const mimeType = mimeTypes.find((type) => file.type.startsWith(type));

  if (!mimeType || !fileMimeExtensions[mimeType]?.includes(`.${extension}`)) {
    app.setIsLoading(true);
    toast.error("Wrong file format");
    return null;
  }

  const isImage = mimeType.startsWith("image");
  const src = await loadMedia(file, app, isImage);
  const size = isImage
    ? await getImageSizeFromSrc(src)
    : await getVideoSizeFromSrc(src);

  const assetId = Utils.uniqueId();
  app.patchState({
    document: {
      assets: {
        [assetId]: {
          id: assetId,
          type: isImage ? "image" : "video",
          name: file.name,
          src,
          size,
        },
      },
    },
  });

  return app.getImageOrVideoShapeAtPoint(id, pagePoint, size, assetId);
};

const getFileExtension = (filename: string): string => {
  return filename.split(".").pop() || "";
};

const loadMedia = async (
  file: File,
  app: TldrawApp,
  isImage: boolean,
): Promise<string> => {
  if (app.callbacks.onAssetCreate) {
    const result = await app.callbacks.onAssetCreate(
      app,
      file,
      Utils.uniqueId(),
    );
    if (result && typeof result === "string") return result;
  }
  return isImage ? fileToBase64(file) : fileToBlobUrl(file);
};

const adjustShapesPosition = (shapes: TDShape[], bounds: number[]): void => {
  const pageWidth = bounds[2];
  const currentPoint = [pageWidth / 2, 0];

  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    const shapeBounds = TLDR.getBounds(shape);
    if (i === 0) currentPoint[0] -= shapeBounds.width / 2;
    shape.point = [...currentPoint];
    currentPoint[0] += shapeBounds.width;
  }
};

export {
  openFromFileSystem,
  importAssetsToS3,
  openAssetsFromFileSystem,
  getFileExtension,
  hasDisallowedExtension,
  createDisallowedFilesErrorMessage,
  handleDisallowedFilesError,
  addMediaFromFiles,
};
