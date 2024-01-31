import { CursorComponent } from "@tldraw/core";
import { UserMetadata } from "../types/UserPresence";
import { hexToRgba } from "../utils/hexToRgba";

const CustomCursor: CursorComponent<UserMetadata> = ({ color, metadata }) => {
  return (
    <div className={"tldraw-cursor-container"}>
      <svg
        width="14"
        height="16"
        viewBox="0 0 14 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1.48692 0.673416L1.48895 0.643219C1.50308 0.597346 1.54381 0.547107 1.63494 0.517105C1.74778 0.479955 1.86261 0.50379 1.93795 0.575031C1.93805 0.575126 1.93815 0.575221 1.93825 0.575317L13.1089 11.2204C13.109 11.2205 13.1092 11.2207 13.1093 11.2208C13.1464 11.2565 13.1563 11.2852 13.1594 11.3025C13.163 11.3222 13.1611 11.3471 13.1485 11.375C13.1245 11.4283 13.057 11.4971 12.9227 11.5022C12.9225 11.5022 12.9224 11.5023 12.9222 11.5023L6.61304 11.7226L6.61304 11.7226L6.60899 11.7228C6.36647 11.7332 6.12139 11.8068 5.91084 11.9561L0.927029 15.4471C0.92698 15.4471 0.92693 15.4471 0.926881 15.4472C0.835247 15.511 0.717004 15.5159 0.617478 15.4683C0.519686 15.4216 0.497388 15.3581 0.500312 15.3099C0.500322 15.3097 0.500332 15.3096 0.500342 15.3094L1.48692 0.673416Z"
          fill={color}
          fillOpacity="0.2"
          stroke={color}
        />
      </svg>
      <div
        className={"tldraw-username-container"}
        style={{ width: "fit-content" }}>
        <div
          className={"tldraw-username"}
          style={{
            borderColor: color,
            backgroundColor: hexToRgba(color, 0.2),
          }}>
          {metadata!.displayName}
        </div>
      </div>
    </div>
  );
};

export default CustomCursor;
