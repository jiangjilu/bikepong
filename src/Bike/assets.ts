import {
  getAllAssetsFromDB,
  saveAssetToDB,
  deleteAssetFromDB,
  clearAllAssetsFromDB,
  createBlobUrl,
  type StoredAsset,
} from "./indexedDB";

// 素材库配置
export interface AssetItem {
  id: string;
  name: string;
  path: string;
  duration?: number;
  isUserUploaded?: boolean;
}

export interface AssetsLibrary {
  videos: AssetItem[];
  audios: AssetItem[];
}

// 默认素材库 - 在 public 文件夹中添加你的素材文件
export const defaultAssetsLibrary: AssetsLibrary = {
  videos: [
    {
      id: "mtb-default",
      name: "MTB 默认视频",
      path: "videos/MTB.mp4",
      duration: 10,
    },
  ],
  audios: [
    {
      id: "gaspedal-default",
      name: "GasPedal 默认音频",
      path: "audios/GasPedal.mp3",
      duration: 30,
    },
  ],
};

// 用户上传的素材（从 IndexedDB 加载）
export let userUploadedAssetsCache: AssetsLibrary = {
  videos: [],
  audios: [],
};

// 从 IndexedDB 加载用户素材
export const loadUserAssetsFromDB = async (): Promise<AssetsLibrary> => {
  try {
    const storedAssets = await getAllAssetsFromDB();
    const videos: AssetItem[] = [];
    const audios: AssetItem[] = [];

    storedAssets.forEach((asset) => {
      const blobUrl = createBlobUrl(asset.blob);
      const item: AssetItem = {
        id: asset.id,
        name: asset.name,
        path: blobUrl,
        duration: asset.duration,
        isUserUploaded: true,
      };

      if (asset.type === "video") {
        videos.push(item);
      } else {
        audios.push(item);
      }
    });

    userUploadedAssetsCache = { videos, audios };
    return userUploadedAssetsCache;
  } catch (error) {
    console.error("从 IndexedDB 加载素材失败:", error);
    return { videos: [], audios: [] };
  }
};

// 初始化 Promise（在浏览器环境中立即开始加载）
export const initPromise =
  typeof window !== "undefined" ? loadUserAssetsFromDB() : Promise.resolve({ videos: [], audios: [] });

// 合并后的素材库
export const assetsLibrary: AssetsLibrary = {
  get videos() {
    return [
      ...defaultAssetsLibrary.videos,
      ...userUploadedAssetsCache.videos,
    ];
  },
  get audios() {
    return [
      ...defaultAssetsLibrary.audios,
      ...userUploadedAssetsCache.audios,
    ];
  },
};

// 添加用户上传的素材
export const addUserAsset = async (
  file: File,
  type: "video" | "audio",
  duration: number,
): Promise<void> => {
  const asset: StoredAsset = {
    id: `user-${type}-${Date.now()}`,
    name: file.name,
    type,
    blob: file,
    duration,
    timestamp: Date.now(),
  };

  await saveAssetToDB(asset);
  await loadUserAssetsFromDB(); // 重新加载缓存
};

// 清除用户上传的素材
export const clearUserAssets = async (
  type?: "videos" | "audios",
): Promise<void> => {
  if (type) {
    // 删除特定类型的素材
    const assetsToDelete =
      type === "videos"
        ? userUploadedAssetsCache.videos
        : userUploadedAssetsCache.audios;

    for (const asset of assetsToDelete) {
      await deleteAssetFromDB(asset.id);
    }
  } else {
    // 清除所有素材
    await clearAllAssetsFromDB();
  }

  await loadUserAssetsFromDB(); // 重新加载缓存
};
