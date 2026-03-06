// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

// 透明视频配置 - ProRes 格式（适合视频剪辑软件）
Config.setVideoImageFormat("png");
Config.setPixelFormat("yuva444p10le");
Config.setCodec("prores");
Config.setProResProfile("4444");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);

// 如果需要 WebM 格式（适合浏览器），使用以下配置：
// Config.setVideoImageFormat("png");
// Config.setPixelFormat("yuva420p");
// Config.setCodec("vp9");
