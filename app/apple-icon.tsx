import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "linear-gradient(135deg, #6b8e5e 0%, #5a7a4f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "20%",
        }}
      >
        <svg
          width="100"
          height="120"
          viewBox="0 0 20 24"
          fill="none"
        >
          <path
            d="M10 2C10 2 3 8 3 14C3 18 6 22 10 22C14 22 17 18 17 14C17 8 10 2 10 2Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M10 6V18M7 11C7 11 10 13 13 11"
            stroke="#6b8e5e"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
