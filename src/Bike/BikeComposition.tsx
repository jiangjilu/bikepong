import { useEffect, useState } from "react";
import { Composition } from "remotion";
import { z } from "zod";
import { Bike } from "./index";
import { initPromise, assetsLibrary } from "./assets";

// 动态生成 schema
const createBikeSchema = () => {
  const videos = assetsLibrary.videos;
  const audios = assetsLibrary.audios;

  const videoIds =
    videos.length > 0
      ? (videos.map((v) => v.id) as [string, ...string[]])
      : (["mtb-default"] as [string, ...string[]]);

  const audioIds =
    audios.length > 0
      ? (audios.map((a) => a.id) as [string, ...string[]])
      : (["gaspedal-default"] as [string, ...string[]]);

  return z.object({
    videoId: z.enum(videoIds).describe("选择视频素材"),
    audioId: z.enum(audioIds).describe("选择音频素材"),
    captionText: z.string().describe("输入文案内容"),
    audioVolume: z.number().min(0).max(1).default(0.5).describe("音频音量"),
  });
};

export const BikeComposition: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [schema, setSchema] = useState(() => createBikeSchema());

  useEffect(() => {
    // 等待 IndexedDB 加载完成
    initPromise.then(() => {
      setSchema(createBikeSchema());
      setIsReady(true);
    });
  }, []);

  // 即使未加载完成也显示 Composition（使用默认素材）
  return (
    <Composition
      id="Bike"
      component={Bike}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      schema={schema}
      defaultProps={{
        videoId: "mtb-default",
        audioId: "gaspedal-default",
        captionText: "欢迎来到骑行世界 享受自由的感觉 让我们一起出发",
        audioVolume: 0.5,
      }}
    />
  );
};
