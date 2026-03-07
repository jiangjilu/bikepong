# Bike 视频组件

一个支持素材管理、字幕显示的 Remotion 视频组件。

## 功能特性

- ✅ 默认素材库（MTB.mp4 + GasPedal.mp3）
- ✅ 用户上传视频和音频
- ✅ 自动生成字幕
- ✅ 音量控制
- ✅ 响应式布局

## 文件结构

```
src/Bike/
├── index.tsx              # 主组件
├── assets.ts              # 素材库配置
├── AssetUploader.tsx      # 素材上传组件
├── BikeWithUploader.tsx   # 带上传功能的完整示例
├── CaptionDisplay.tsx     # 字幕显示组件
└── README.md              # 本文件
```

## 快速开始

### 1. 基本使用

```tsx
import { Bike } from "./Bike";

<Bike
  videoId="mtb-default"
  audioId="gaspedal-default"
  captionText="你的文案内容"
  audioVolume={0.5}
/>
```

### 2. 带上传功能

```tsx
import { BikeWithUploader } from "./Bike/BikeWithUploader";

<BikeWithUploader
  videoId="mtb-default"
  audioId="gaspedal-default"
  captionText="你的文案内容"
  audioVolume={0.5}
/>
```

### 3. 自定义素材管理

```tsx
import { AssetUploader } from "./Bike/AssetUploader";
import { addUserAsset, assetsLibrary } from "./Bike/assets";

// 使用上传组件
<AssetUploader onAssetAdded={() => console.log("素材已添加")} />

// 或编程方式添加
addUserAsset("videos", {
  id: "my-video",
  name: "我的视频",
  path: blobUrl,
  duration: 10,
});
```

## Props 说明

### Bike Component

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| videoId | string | - | 视频素材 ID |
| audioId | string | - | 音频素材 ID |
| captionText | string | - | 字幕文案 |
| audioVolume | number | 0.5 | 音量 (0-1) |

## 素材管理 API

### assetsLibrary

获取当前所有可用素材：

```tsx
import { assetsLibrary } from "./Bike/assets";

console.log(assetsLibrary.videos); // 所有视频
console.log(assetsLibrary.audios); // 所有音频
```

### addUserAsset

添加用户上传的素材：

```tsx
import { addUserAsset } from "./Bike/assets";

addUserAsset("videos", {
  id: "unique-id",
  name: "显示名称",
  path: "blob:... 或 videos/file.mp4",
  duration: 10,
});
```

### clearUserAssets

清除用户上传的素材：

```tsx
import { clearUserAssets } from "./Bike/assets";

clearUserAssets("videos"); // 清除视频
clearUserAssets("audios"); // 清除音频
clearUserAssets();         // 清除所有
```

## 默认素材

确保以下文件存在：

```
public/
├── videos/
│   └── MTB.mp4
└── audios/
    └── GasPedal.mp3
```

## 字幕功能

字幕会自动根据 `captionText` 生成，支持：
- 中英文混合
- 按句子和单词分割
- TikTok 风格动画效果

## 注意事项

1. 用户上传的素材使用 blob URL，刷新后会丢失
2. 默认素材需要放在 public 文件夹中
3. 支持的格式取决于浏览器支持
4. 建议视频分辨率为 1920x1080

## 扩展开发

### 添加新的默认素材

编辑 `assets.ts`：

```tsx
export const defaultAssetsLibrary: AssetsLibrary = {
  videos: [
    {
      id: "mtb-default",
      name: "MTB 默认视频",
      path: "videos/MTB.mp4",
      duration: 10,
    },
    // 添加更多...
  ],
  audios: [
    // ...
  ],
};
```

### 自定义字幕样式

修改 `CaptionDisplay.tsx` 中的样式。

### 持久化用户素材

实现服务器端存储或使用 localStorage。
