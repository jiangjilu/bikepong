# Bike Composition 使用说明

## 功能特性

1. **素材库管理** - 集中管理视频和音频素材
2. **可视化选择** - 在 Remotion Studio 中通过下拉菜单选择素材
3. **自动字幕生成** - 输入文案自动生成带高亮效果的字幕
4. **透明背景导出** - 支持导出透明背景视频用于剪辑

## 文件结构

```
src/Bike/
├── index.tsx           # 主组件
├── CaptionDisplay.tsx  # 字幕显示组件
└── assets.ts           # 素材库配置

public/
├── videos/             # 视频素材文件夹
└── audios/             # 音频素材文件夹
```

## 使用步骤

### 1. 添加素材文件

将你的视频和音频文件放入对应文件夹：

- 视频：`public/videos/` 
  - bike-scene-1.mp4
  - bike-scene-2.mp4
  - bike-scene-3.mp4

- 音频：`public/audios/`
  - bgm-1.mp3
  - bgm-2.mp3
  - bgm-3.mp3

### 2. 更新素材库配置

编辑 `src/Bike/assets.ts`，添加或修改素材信息：

```typescript
export const assetsLibrary: AssetsLibrary = {
  videos: [
    {
      id: "bike-1",
      name: "骑行场景1",
      path: "videos/bike-scene-1.mp4",
      duration: 10,
    },
    // 添加更多视频...
  ],
  audios: [
    {
      id: "bgm-1",
      name: "背景音乐1",
      path: "audios/bgm-1.mp3",
      duration: 30,
    },
    // 添加更多音频...
  ],
};
```

### 3. 在 Remotion Studio 中编辑

启动 Remotion Studio：
```bash
npm start
```

在侧边栏选择 "Bike" composition，你可以：

- **选择视频素材** - 从下拉菜单选择视频
- **选择音频素材** - 从下拉菜单选择背景音乐
- **输入文案** - 输入字幕文案内容
- **调整音量** - 设置背景音乐音量（0-1）

### 4. 导出视频

导出透明背景视频（ProRes 格式，适合剪辑软件）：
```bash
npx remotion render Bike output.mov
```

导出 WebM 格式（适合浏览器）：
```bash
npx remotion render Bike output.webm --codec=vp9 --pixel-format=yuva420p
```

## 字幕功能说明

- 字幕会自动根据文案生成时间轴
- 支持中英文混合
- 当前词高亮显示（金色）
- 其他词显示为白色
- 带半透明黑色背景和阴影效果

## 自定义配置

### 修改字幕样式

编辑 `src/Bike/CaptionDisplay.tsx`：

```typescript
const HIGHLIGHT_COLOR = "#FFD700"; // 高亮颜色
const TEXT_COLOR = "#FFFFFF";      // 文字颜色

// 修改字幕位置、大小、样式等
style={{
  fontSize: 60,
  fontWeight: "bold",
  paddingBottom: 100,
  // ...
}}
```

### 修改字幕切换速度

编辑 `src/Bike/index.tsx`：

```typescript
const SWITCH_CAPTIONS_EVERY_MS = 1200; // 毫秒，数值越大每页显示越多词
```

### 添加更多参数

在 `bikeSchema` 中添加更多可配置项：

```typescript
export const bikeSchema = z.object({
  // 现有参数...
  videoOpacity: z.number().min(0).max(1).default(1),
  captionFontSize: z.number().min(20).max(100).default(60),
  // ...
});
```

## 注意事项

1. 确保素材文件路径与 `assets.ts` 中配置一致
2. 视频和音频格式建议使用浏览器支持的格式（MP4, WebM, MP3, WAV）
3. 大文件可能影响预览性能，建议使用压缩后的素材
4. 字幕时长会根据文案长度自动计算，可根据需要调整 composition 的 `durationInFrames`

## 依赖包

确保已安装以下依赖：

```bash
npm install zod @remotion/media @remotion/captions
```

如果缺少依赖，运行：
```bash
npx remotion add @remotion/media
npx remotion add @remotion/captions
npm install zod
```
