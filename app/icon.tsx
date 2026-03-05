import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Generated favicon / /icon.png
 * Solid blue square with white "R" — placeholder until a real logo PNG is added.
 * Delete this file and place a real icon.png in /public once a logo is ready.
 */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "#1d4ed8",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
      }}
    >
      <span
        style={{
          color: "white",
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.5px",
        }}
      >
        R
      </span>
    </div>,
    { ...size },
  );
}
