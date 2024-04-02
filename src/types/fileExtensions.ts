export type FileExtension = ".jpg" | ".jpeg" | ".png" | ".svg" | ".gif";

export const fileMimeExtensions: { [key: string]: FileExtension[] } = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/svg+xml": [".svg"],
    "image/gif": [".gif"],
};
