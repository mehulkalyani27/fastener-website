import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const [primary, ...rest] = siteConfig.name.split(" ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          background: "#1F2440",
          color: "#FFFFFF",
        }}
      >
        <svg width="180" height="187" viewBox="0 0 200 208" fill="#FFFFFF">
          <path d="M0,0 L82.2,61.8 L60,78.6 L30,56 V208 H0 Z" />
          <path d="M191.4,0 H200 V31.4 L91,112.1 V208 H61 V96.6 Z" />
          <path d="M200,62 L170,84.2 V208 H200 Z" />
          <path d="M142,105 V142 L61,202 V165.3 Z" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: 2 }}>
            {primary.toUpperCase()}
          </div>
          <div style={{ fontSize: 40, letterSpacing: 14, color: "#A9B0C9", marginTop: 8 }}>
            {rest.join(" ").toUpperCase()}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
