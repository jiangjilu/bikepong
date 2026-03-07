import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { TikTokPage } from "@remotion/captions";

interface CaptionDisplayProps {
  page: TikTokPage;
}

const HIGHLIGHT_COLOR = "#FFD700"; // 金色高亮
const TEXT_COLOR = "#FFFFFF"; // 白色文字

export const CaptionDisplay: React.FC<CaptionDisplayProps> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTimeMs = (frame / fps) * 1000;
  const absoluteTimeMs = page.startMs + currentTimeMs;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 100,
      }}
    >
      <div
        style={{
          fontSize: 60,
          fontWeight: "bold",
          whiteSpace: "pre",
          textAlign: "center",
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          padding: "20px 40px",
          backgroundColor: "rgba(0,0,0,0.5)",
          borderRadius: 10,
          maxWidth: "80%",
        }}
      >
        {page.tokens.map((token) => {
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;

          return (
            <span
              key={token.fromMs}
              style={{
                color: isActive ? HIGHLIGHT_COLOR : TEXT_COLOR,
                transition: "color 0.1s ease",
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
