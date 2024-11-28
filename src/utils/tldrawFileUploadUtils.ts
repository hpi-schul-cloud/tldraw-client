/**
 *  Functions in this file were copied from the tldraw package.
 *  We needed to change allowed extensions and fix some bugs related to file upload.
 *  @see Source code https://github.com/tldraw/tldraw-v1/blob/main/packages/tldraw/src/state/TldrawApp.ts
 *  @see Function we replaced with our own: openAssetsFromFileSystem
 **/

import { TldrawApp } from "@tldraw/tldraw";
import { fileOpen } from "browser-fs-access";
import { envs } from "../stores/setup";

// those are all the image extensions that are supported by tldraw
const IMAGE_EXTENSIONS = [".png", ".svg", ".jpg", ".jpeg", ".gif"];

const isSafari =
  typeof Window === "undefined"
    ? false
    : /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// those are all the video extensions that are supported by tldraw
const VIDEO_EXTENSIONS = isSafari ? [] : [".mp4", ".webm"];

// those are mime types/extensions that we allow
// no video extensions are allowed for now due to buggy video support
const fileMimeExtensions: { [key: string]: string[] } = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/svg+xml": [".svg"],
  "image/gif": [".gif"],
};

const allowedMimeTypes = envs?.TLDRAW_ASSETS_ALLOWED_MIME_TYPES_LIST || [];

const allowedExtensions = allowedMimeTypes.flatMap(
  (mimeType) => fileMimeExtensions[mimeType] || [],
);

const openAssetsFromFileSystem = async () => {
  const result = await fileOpen({
    description: "Image",
    extensions: allowedExtensions,
    multiple: true,
  });
  return result;
};

const getViewboxFromSVG = (
  app: TldrawApp,
  svgStr: string | ArrayBuffer | null,
) => {
  const viewBoxRegex =
    /.*?viewBox=["'](-?[\d.]+[, ]+-?[\d.]+[, ][\d.]+[, ][\d.]+)["']/;

  if (typeof svgStr === "string") {
    const matches = svgStr.match(viewBoxRegex);
    return matches && matches.length >= 2 ? matches[1] : null;
  }

  app.setIsLoading(false);

  return null;
};

const getImageSizeFromSrc = (src: string): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve([img.width, img.height]);
    img.onerror = () => reject(new Error("Could not get image size"));
    img.src = src;
  });
};

const getVideoSizeFromSrc = (src: string): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.onloadedmetadata = () =>
      resolve([video.videoWidth, video.videoHeight]);
    video.onerror = () => reject(new Error("Could not get video size"));
    video.src = src;
  });
};

export {
  getImageSizeFromSrc,
  getVideoSizeFromSrc,
  getViewboxFromSVG,
  IMAGE_EXTENSIONS,
  openAssetsFromFileSystem,
  VIDEO_EXTENSIONS,
};
