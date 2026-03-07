import { z } from "zod";
import {
  AbsoluteFill,
  staticFile,
  Sequence,
  useVideoConfig,
  delayRender,
  continueRender,
} from "remotion";
import { Video } from "@remotion/media";
import { Audio } from "@remotion/media";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { CaptionDisplay } from "./CaptionDisplay";
import { assetsLibrary } from "./assets";

// 定义 Schema
export const bikeSchema = z.object({
  videoId: z
    .enum(
      assetsLibrary.videos.map((v) => v.id) as [string, ...string[]],
    )
    .describe("选择视频素材"),
  audioId: z
    .enum(
      assetsLibrary.audios.map((a) => a.id) as [string, ...string[]],
    )
    .describe("选择音频素材"),
  captionText: z.string().describe("输入文案内容"),
  audioVolume: z.number().min(0).max(1).default(0.5).describe("音频音量"),
});

export type BikeProps = z.infer<typeof bikeSchema>;

const SWITCH_CAPTIONS_EVERY_MS = 1200;

export const Bike: React.FC<BikeProps> = ({
  videoId,
  audioId,
  captionText,
  audioVolume,
}) => {
  const { fps } = useVideoConfig();
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading captions"));

  // 获取选中的素材
  const selectedVideo = assetsLibrary.videos.find((v) => v.id === videoId);
  const selectedAudio = assetsLibrary.audios.find((a) => a.id === audioId);

  // 生成字幕数据
  const generateCaptions = useCallback(() => {
    if (!captionText) {
      setCaptions([]);
      continueRender(handle);
      return;
    }

    // 将文案按句子分割
    const sentences = captionText
      .split(/[。！？.!?]/)
      .filter((s) => s.trim().length > 0);

    // 为每个句子生成字幕时间轴
    const generatedCaptions: Caption[] = [];
    let currentTime = 0;
    const avgDuration = 2000; // 每句平均2秒

    sentences.forEach((sentence) => {
      const words = sentence.trim().split(/\s+/);
      const wordDuration = avgDuration / words.length;

      words.forEach((word, index) => {
        generatedCaptions.push({
          text: index === 0 ? word : ` ${word}`,
          startMs: currentTime,
          endMs: currentTime + wordDuration,
          timestampMs: currentTime,
          confidence: 1,
        });
        currentTime += wordDuration;
      });
    });

    setCaptions(generatedCaptions);
    continueRender(handle);
  }, [captionText, handle]);

  useEffect(() => {
    generateCaptions();
  }, [generateCaptions]);

  // 创建字幕页面
  const { pages } = useMemo(() => {
    if (!captions || captions.length === 0) {
      return { pages: [] };
    }
    return createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
    });
  }, [captions]);

  // 检查文件是否存在（通过检查路径）
  const hasVideoFile = false; // 设置为 false 用于测试
  const hasAudioFile = false; // 设置为 false 用于测试

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 背景视频 - 如果素材不存在则显示占位符 */}
      {selectedVideo && hasVideoFile ? (
        <Video
          src={staticFile(selectedVideo.path)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          muted
        />
      ) : (
        <AbsoluteFill
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 80,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            🚴 BIKE
          </div>
          <div
            style={{
              color: "white",
              fontSize: 30,
              marginTop: 20,
              opacity: 0.8,
            }}
          >
            {selectedVideo?.name || "演示模式"}
          </div>
        </AbsoluteFill>
      )}

      {/* 背景音乐 - 如果素材存在才播放 */}
      {selectedAudio && hasAudioFile && (
        <Audio src={staticFile(selectedAudio.path)} volume={audioVolume} />
      )}

      {/* 字幕 */}
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = (page.startMs / 1000) * fps;
        const endFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          startFrame + (SWITCH_CAPTIONS_EVERY_MS / 1000) * fps,
        );
        const durationInFrames = endFrame - startFrame;

        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <CaptionDisplay page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
