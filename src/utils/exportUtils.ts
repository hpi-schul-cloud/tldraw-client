import {
  TDExportBackground,
  TDExportType,
  TDShape,
  TDShapeType,
  TLDR,
  TldrawApp,
} from "@tldraw/tldraw";
import { Utils } from "@tldraw/core";

export const getBlob = async (
  app: TldrawApp,
  type: string,
): Promise<Blob | undefined> => {
  const format = type as TDExportType;
  if (format === TDExportType.JSON) return;

  const svg = await getSvg(app, format);
  if (!svg) return;

  if (format === TDExportType.SVG) {
    const svgString = TLDR.getSvgString(svg, 1);
    const blob = new Blob([svgString], { type: "image/svg+xml" });

    return blob;
  }

  const imageBlob = await TLDR.getImageForSvg(svg, format, {
    scale: 2,
    quality: 1,
  });

  return imageBlob;
};

const getSvg = async (
  app: TldrawApp,
  format: TDExportType,
): Promise<SVGElement | undefined> => {
  const SVG_EXPORT_PADDING = 16;

  const ids = app.selectedIds.length
    ? app.selectedIds
    : Object.keys(app.page.shapes);
  const includeFonts = format !== TDExportType.SVG;

  if (ids.length === 0) return;

  // Embed our custom fonts
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");

  if (typeof window !== "undefined") {
    window.focus(); // weird but necessary
  }

  if (includeFonts) {
    try {
      const { fonts } = await fetch(TldrawApp.assetSrc, {
        mode: "no-cors",
      }).then((d) => d.json());

      style.textContent = `
          @font-face {
            font-family: 'Caveat Brush';
            src: url(data:application/x-font-woff;charset=utf-8;base64,${fonts.caveat}) format('woff');
            font-weight: 500;
            font-style: normal;
          }
          @font-face {
            font-family: 'Source Code Pro';
            src: url(data:application/x-font-woff;charset=utf-8;base64,${fonts.source_code_pro}) format('woff');
            font-weight: 500;
            font-style: normal;
          }
          @font-face {
            font-family: 'Source Sans Pro';
            src: url(data:application/x-font-woff;charset=utf-8;base64,${fonts.source_sans_pro}) format('woff');
            font-weight: 500;
            font-style: normal;
          }
          @font-face {
            font-family: 'Crimson Pro';
            src: url(data:application/x-font-woff;charset=utf-8;base64,${fonts.crimson_pro}) format('woff');
            font-weight: 500;
            font-style: normal;
          }
          `;
    } catch (e) {
      TLDR.warn("Could not find tldraw-assets.json file.");
    }
  } else {
    style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Source+Code+Pro&family=Source+Sans+Pro&family=Crimson+Pro&display=block');`;
  }

  defs.append(style);
  svg.append(defs);

  // Get the shapes in order
  const shapes = ids
    .map((id) => app.getShape(id, app.currentPageId))
    .sort((a, b) => a.childIndex - b.childIndex);

  // Find their common bounding box. Shapes will be positioned relative to this box
  const commonBounds = Utils.getCommonBounds(shapes.map(TLDR.getRotatedBounds));

  // A quick routine to get an SVG element for each shape
  const getSvgElementForShape = (shape: TDShape) => {
    const util = TLDR.getShapeUtil(shape);
    const bounds = util.getBounds(shape);
    const elm = util.getSvgElement(shape, app.settings.isDarkMode);

    if (!elm) return;

    // If the element is an image, set the asset src as the xlinkhref
    if (shape.type === TDShapeType.Image) {
      elm.setAttribute("xlink:href", serializeImage(shape.id));
    } else if (shape.type === TDShapeType.Video) {
      elm.setAttribute("xlink:href", app.serializeVideo(shape.id));
    }

    // Put the element in the correct position relative to the common bounds
    elm.setAttribute(
      "transform",
      `translate(${(
        SVG_EXPORT_PADDING +
        shape.point[0] -
        commonBounds.minX
      ).toFixed(2)}, ${(
        SVG_EXPORT_PADDING +
        shape.point[1] -
        commonBounds.minY
      ).toFixed(2)}) rotate(${(((shape.rotation || 0) * 180) / Math.PI).toFixed(
        2,
      )}, ${(bounds.width / 2).toFixed(2)}, ${(bounds.height / 2).toFixed(2)})`,
    );

    return elm;
  };

  // Assemble the final SVG by iterating through each shape and its children
  shapes.forEach((shape) => {
    // The shape is a group! Just add the children.
    if (shape.children?.length) {
      // Create a group <g> elm for shape
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

      // Get the shape's children as elms and add them to the group
      shape.children.forEach((childId) => {
        const shape = app.getShape(childId, app.currentPageId);
        const elm = getSvgElementForShape(shape);

        if (elm) {
          g.append(elm);
        }
      });

      // Add the group elm to the SVG
      svg.append(g);

      return;
    }

    // Just add the shape's element to the
    const elm = getSvgElementForShape(shape);

    if (elm) {
      svg.append(elm);
    }
  });

  // Resize the elm to the bounding box
  svg.setAttribute(
    "viewBox",
    [
      0,
      0,
      commonBounds.width + SVG_EXPORT_PADDING * 2,
      commonBounds.height + SVG_EXPORT_PADDING * 2,
    ].join(" "),
  );

  // Clean up the SVG by removing any hidden elements
  svg.setAttribute(
    "width",
    (commonBounds.width + SVG_EXPORT_PADDING * 2).toString(),
  );
  svg.setAttribute(
    "height",
    (commonBounds.height + SVG_EXPORT_PADDING * 2).toString(),
  );

  // Set export background
  const exportBackground: TDExportBackground = app.settings.exportBackground;
  const darkBackground = "#212529";
  const lightBackground = "rgb(248, 249, 250)";

  switch (exportBackground) {
    case TDExportBackground.Auto: {
      svg.style.setProperty(
        "background-color",
        app.settings.isDarkMode ? darkBackground : lightBackground,
      );
      break;
    }
    case TDExportBackground.Dark: {
      svg.style.setProperty("background-color", darkBackground);
      break;
    }
    case TDExportBackground.Light: {
      svg.style.setProperty("background-color", lightBackground);
      break;
    }
    case TDExportBackground.Transparent:
    default: {
      svg.style.setProperty("background-color", "transparent");
      break;
    }
  }

  svg
    .querySelectorAll(
      ".tl-fill-hitarea, .tl-stroke-hitarea, .tl-binding-indicator",
    )
    .forEach((elm) => elm.remove());

  return svg;
};

const serializeImage = (id: string): string => {
  const image = document.getElementById(id + "_image") as HTMLImageElement;
  if (image) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d")!.drawImage(image, 0, 0);
    return canvas.toDataURL("image/png");
  } else throw new Error("Image with id " + id + " not found");
};
