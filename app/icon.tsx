import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#6b8e5e",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "50%",
        }}
      >
        <svg
          width="20"
          height="24"
          viewBox="0 0 20 24"
          fill="none"
          style={{ marginTop: -2 }}
        >
          <path
            d="M10 2C10 2 3 8 3 14C3 18 6 22 10 22C14 22 17 18 17 14C17 8 10 2 10 2Z"
            fill="white"
            fillOpacity="0.95"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
