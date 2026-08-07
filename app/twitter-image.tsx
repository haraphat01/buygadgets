import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 28,
            background: "#fafafa",
            color: "#0a0a0a",
            fontSize: 76,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          B
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>BuyGadgets</div>
        <div style={{ display: "flex", fontSize: 32, color: "#a1a1a1", marginTop: 16 }}>
          Smartphones, tablets & gadgets — delivered fast.
        </div>
      </div>
    ),
    { ...size },
  );
}
