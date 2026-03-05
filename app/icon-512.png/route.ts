import { ImageResponse } from "next/og";

/** Serves /icon-512.png for PWA manifest */
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
          borderRadius: 80,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 290,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-5px",
          }}
        >
          R
        </span>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
