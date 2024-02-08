/**
 *  Custom function for exporting images stored in external storage correctly
 **/

export const serializeImage = (id: string): string => {
  const image = document.getElementById(id + "_image") as HTMLImageElement;
  if (image) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d")!.drawImage(image, 0, 0);
    return canvas.toDataURL("image/png");
  } else throw new Error("Image with id " + id + " not found");
};
