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

// Props 类型定义
export interface BikeProps {
  videoId: string;
  audioId: string;
  captionText: string;
  audioVolume: number;
}

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

  // 如果找不到素材，显示可用素材列表
  if (!selectedVideo) {
    console.warn(`视频素材 "${videoId}" 未找到。可用素材:`, assetsLibrary.videos.map(v => v.id));
  }
  if (!selectedAudio) {
    console.warn(`音频素材 "${audioId}" 未找到。可用素材:`, assetsLibrary.audios.map(a => a.id));
  }

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

  // 判断是否为用户上传的素材（blob URL）
  const isUserUploadedVideo = selectedVideo?.isUserUploaded || selectedVideo?.path.startsWith("blob:");
  const isUserUploadedAudio = selectedAudio?.isUserUploaded || selectedAudio?.path.startsWith("blob:");

  // 获取视频源
  const videoSrc = selectedVideo
    ? isUserUploadedVideo
      ? selectedVideo.path
      : staticFile(selectedVideo.path)
    : null;

  // 获取音频源
  const audioSrc = selectedAudio
    ? isUserUploadedAudio
      ? selectedAudio.path
      : staticFile(selectedAudio.path)
    : null;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* 背景视频 */}
      {videoSrc ? (
        <Video
          src={videoSrc}
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

      {/* 背景音乐 */}
      {audioSrc && <Audio src={audioSrc} volume={audioVolume} />}

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
