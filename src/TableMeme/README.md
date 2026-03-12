# Table Meme 组件

一个可配置的梗图动画模板，用于创建"老师问XXX是什么"类型的搞笑视频。

## 动画流程

1. **问题部分**（0-2秒）：直接显示问题，中间的关键词用黄色高亮
2. **学霸回答**（2-5秒）：淡入显示学霸的正经回答 + 图片/视频 + 魔法音效
3. **我的回答**（5-9秒）：缩放旋转入场，隆重展示搞笑回答 + 图片/视频 + 反转音效

## 配置参数

### 问题部分
- `questionPrefix`: 问题前缀（默认："老师问"）
- `highlightWord`: 高亮的关键词（默认："table"）
- `questionSuffix`: 问题后缀（默认："是什么？"）

### 学霸回答
- `smartStudentLabel`: 标签（默认："学霸："）
- `smartStudentAnswer`: 回答文本（默认："桌子"）
- `smartStudentMedia`: 媒体文件路径（默认："images/table.jpg"）
- `smartStudentMediaType`: 媒体类型 "image" 或 "video"（默认："image"）
- `smartStudentSfx`: 音效文件路径（默认："audios/magic.mp3"）

### 我的回答
- `myLabel`: 标签（默认："我："）
- `myMedia`: 媒体文件路径（默认："videos/table.mp4"）
- `myMediaType`: 媒体类型 "image" 或 "video"（默认："video"）
- `mySfx`: 音效文件路径（默认："audios/alert.mp3"）

### 其他
- `sfxVolume`: 音效音量 0-1（默认：0.5）

## 使用示例

### 示例1：默认配置（table梗）
```typescript
{
  questionPrefix: "老师问",
  highlightWord: "table",
  questionSuffix: "是什么？",
  smartStudentLabel: "学霸：",
  smartStudentAnswer: "桌子",
  smartStudentMedia: "images/table.jpg",
  smartStudentMediaType: "image",
  smartStudentSfx: "audios/magic.mp3",
  myLabel: "我：",
  myMedia: "videos/table.mp4",
  myMediaType: "video",
  mySfx: "audios/alert.mp3",
  sfxVolume: 0.5
}
```

### 示例2：自定义单词
```typescript
{
  questionPrefix: "老师问",
  highlightWord: "run",
  questionSuffix: "是什么意思？",
  smartStudentLabel: "学霸：",
  smartStudentAnswer: "跑步",
  smartStudentMedia: "running.jpg",
  smartStudentMediaType: "image",
  smartStudentSfx: "magic.mp3",
  myLabel: "我：",
  myMedia: "program-crash.gif",
  myMediaType: "image",
  mySfx: "error.mp3",
  sfxVolume: 0.6
}
```

## 素材准备

### 图片素材
将图片放在 `public/images/` 目录下，然后在配置中使用相对路径：
```
smartStudentMedia: "images/desk.jpg"
```

### 视频素材
将视频放在 `public/videos/` 目录下：
```
myMedia: "videos/MTB.mp4"
```

### 音效素材
将音效放在 `public/audios/` 目录下：
```
smartStudentSfx: "audios/magic.mp3"
mySfx: "audios/GasPedal.mp3"
```

## 推荐音效

### 学霸回答音效（魔法/厉害的效果）
- 魔法音效
- 叮铃铃音效
- 成功提示音
- 闪光音效

### 我的回答音效（反转/警告/奇怪的效果）
- 唱片刮擦音
- 警报音
- 错误提示音
- 戏剧性转折音效
- 引擎轰鸣声（如当前的 GasPedal.mp3）

## 时长说明

- 总时长：9秒（270帧 @ 30fps）
- 问题显示：2秒
- 学霸回答：3秒
- 我的回答：4秒

可以在 Root.tsx 中修改 `durationInFrames` 来调整总时长。
