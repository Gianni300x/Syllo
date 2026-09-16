import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
          borderRadius: 8,
          color: "#fff",
          fontSize: 20,
          fontWeight: 600,
          fontFamily: "sans-serif",
        }}
      >
        S
      </div>
    ),
    { ...size },
  );
}
