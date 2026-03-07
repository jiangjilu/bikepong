// 素材库配置
export interface AssetItem {
  id: string;
  name: string;
  path: string;
  duration?: number; // 视频/音频时长（秒）
}

export interface AssetsLibrary {
  videos: AssetItem[];
  audios: AssetItem[];
}

// 素材库 - 在 public 文件夹中添加你的素材文件
export const assetsLibrary: AssetsLibrary = {
  videos: [
    {
      id: "bike-1",
      name: "骑行场景1",
      path: "videos/bike-scene-1.mp4",
      duration: 10,
    },
    {
      id: "bike-2",
      name: "骑行场景2",
      path: "videos/bike-scene-2.mp4",
      duration: 8,
    },
    {
      id: "bike-3",
      name: "骑行场景3",
      path: "videos/bike-scene-3.mp4",
      duration: 12,
    },
  ],
  audios: [
    {
      id: "bgm-1",
      name: "背景音乐1",
      path: "audios/bgm-1.mp3",
      duration: 30,
    },
    {
      id: "bgm-2",
      name: "背景音乐2",
      path: "audios/bgm-2.mp3",
      duration: 45,
    },
    {
      id: "bgm-3",
      name: "背景音乐3",
      path: "audios/bgm-3.mp3",
      duration: 60,
    },
  ],
};
