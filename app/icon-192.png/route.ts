import { ImageResponse } from "next/og";

/** Serves /icon-192.png for PWA manifest */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1d4ed8",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 32,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 110,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-2px",
          }}
        >
          R
        </span>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
