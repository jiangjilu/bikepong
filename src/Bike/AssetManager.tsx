import React, { useState, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { addUserAsset, assetsLibrary, clearUserAssets } from "./assets";

export const AssetManager: React.FC = () => {
  const [, forceUpdate] = useState({});
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleFileUpload = async (file: File, type: "videos" | "audios") => {
    setUploading(true);

    try {
      // 创建临时 URL 用于获取时长
      const tempUrl = URL.createObjectURL(file);
      const duration = await getMediaDuration(tempUrl, type);
      URL.revokeObjectURL(tempUrl); // 释放临时 URL

      // 保存到 IndexedDB
      await addUserAsset(file, type === "videos" ? "video" : "audio", duration);

      // 提示用户刷新页面以更新下拉选项
      showMessage(
        `✅ ${type === "videos" ? "视频" : "音频"}上传成功！正在刷新页面...`,
      );

      // 延迟刷新，让用户看到成功消息
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("上传失败:", error);
      showMessage("❌ 上传失败，请重试");
      setUploading(false);
    }
  };

  const getMediaDuration = (
    url: string,
    type: "videos" | "audios",
  ): Promise<number> => {
    return new Promise((resolve, reject) => {
      const element =
        type === "videos"
          ? document.createElement("video")
          : document.createElement("audio");

      element.src = url;
      element.onloadedmetadata = () => {
        resolve(element.duration);
      };
      element.onerror = () => {
        reject(new Error("无法加载媒体文件"));
      };
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "videos");
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "audios");
    }
  };

  const handleClearAssets = async (type?: "videos" | "audios") => {
    await clearUserAssets(type);
    showMessage(
      `🗑️ 已清除${type === "videos" ? "视频" : type === "audios" ? "音频" : "所有"}素材，正在刷新...`,
    );

    // 刷新页面以更新下拉选项
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
        padding: 40,
        fontFamily: "Arial, sans-serif",
        overflow: "auto",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* 标题 */}
        <h1
          style={{
            color: "#fff",
            fontSize: 48,
            marginBottom: 10,
            fontWeight: "bold",
          }}
        >
          🎬 素材管理中心
        </h1>
        <p style={{ color: "#aaa", fontSize: 18, marginBottom: 40 }}>
          上传视频和音频素材，然后在 Bike 组件中使用
        </p>

        {/* 消息提示 */}
        {message && (
          <div
            style={{
              backgroundColor: "#2ecc71",
              color: "#fff",
              padding: 15,
              borderRadius: 8,
              marginBottom: 30,
              fontSize: 16,
            }}
          >
            {message}
          </div>
        )}

        {/* 上传区域 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 30,
            marginBottom: 40,
          }}
        >
          {/* 视频上传 */}
          <div
            style={{
              backgroundColor: "#16213e",
              padding: 30,
              borderRadius: 12,
              border: "2px solid #0f3460",
            }}
          >
            <h2 style={{ color: "#fff", fontSize: 24, marginBottom: 20 }}>
              📹 上传视频
            </h2>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              style={{ display: "none" }}
            />
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
              style={{
                width: "100%",
                padding: 20,
                backgroundColor: uploading ? "#555" : "#e94560",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 18,
                fontWeight: "bold",
                cursor: uploading ? "not-allowed" : "pointer",
                transition: "all 0.3s",
              }}
            >
              {uploading ? "上传中..." : "选择视频文件"}
            </button>
            <p style={{ color: "#888", fontSize: 14, marginTop: 15 }}>
              支持 MP4, MOV, AVI 等格式<br />
              使用 IndexedDB 存储，支持大文件
            </p>
          </div>

          {/* 音频上传 */}
          <div
            style={{
              backgroundColor: "#16213e",
              padding: 30,
              borderRadius: 12,
              border: "2px solid #0f3460",
            }}
          >
            <h2 style={{ color: "#fff", fontSize: 24, marginBottom: 20 }}>
              🎵 上传音频
            </h2>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              style={{ display: "none" }}
            />
            <button
              onClick={() => audioInputRef.current?.click()}
              disabled={uploading}
              style={{
                width: "100%",
                padding: 20,
                backgroundColor: uploading ? "#555" : "#533483",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 18,
                fontWeight: "bold",
                cursor: uploading ? "not-allowed" : "pointer",
                transition: "all 0.3s",
              }}
            >
              {uploading ? "上传中..." : "选择音频文件"}
            </button>
            <p style={{ color: "#888", fontSize: 14, marginTop: 15 }}>
              支持 MP3, WAV, AAC 等格式<br />
              使用 IndexedDB 存储，支持大文件
            </p>
          </div>
        </div>

        {/* 素材库展示 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 30,
          }}
        >
          {/* 视频列表 */}
          <div
            style={{
              backgroundColor: "#16213e",
              padding: 30,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ color: "#fff", fontSize: 20, margin: 0 }}>
                视频素材库 ({assetsLibrary.videos.length})
              </h3>
              {assetsLibrary.videos.length > 1 && (
                <button
                  onClick={() => handleClearAssets("videos")}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 5,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  清除上传
                </button>
              )}
            </div>
            <div style={{ maxHeight: 300, overflow: "auto" }}>
              {assetsLibrary.videos.map((video, index) => (
                <div
                  key={video.id}
                  style={{
                    backgroundColor: "#0f3460",
                    padding: 15,
                    borderRadius: 8,
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ color: "#fff", fontSize: 16 }}>
                      {video.name}
                    </div>
                    <div style={{ color: "#888", fontSize: 12, marginTop: 5 }}>
                      {video.duration?.toFixed(1)}秒 •{" "}
                      {video.id.includes("default") ? "默认素材" : "用户上传"}
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#2ecc71",
                      fontSize: 24,
                    }}
                  >
                    {index === 0 ? "⭐" : "📹"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 音频列表 */}
          <div
            style={{
              backgroundColor: "#16213e",
              padding: 30,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ color: "#fff", fontSize: 20, margin: 0 }}>
                音频素材库 ({assetsLibrary.audios.length})
              </h3>
              {assetsLibrary.audios.length > 1 && (
                <button
                  onClick={() => handleClearAssets("audios")}
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 5,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  清除上传
                </button>
              )}
            </div>
            <div style={{ maxHeight: 300, overflow: "auto" }}>
              {assetsLibrary.audios.map((audio, index) => (
                <div
                  key={audio.id}
                  style={{
                    backgroundColor: "#0f3460",
                    padding: 15,
                    borderRadius: 8,
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ color: "#fff", fontSize: 16 }}>
                      {audio.name}
                    </div>
                    <div style={{ color: "#888", fontSize: 12, marginTop: 5 }}>
                      {audio.duration?.toFixed(1)}秒 •{" "}
                      {audio.id.includes("default") ? "默认素材" : "用户上传"}
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#9b59b6",
                      fontSize: 24,
                    }}
                  >
                    {index === 0 ? "⭐" : "🎵"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div
          style={{
            backgroundColor: "#16213e",
            padding: 30,
            borderRadius: 12,
            marginTop: 30,
            border: "2px solid #2ecc71",
          }}
        >
          <h3 style={{ color: "#2ecc71", fontSize: 20, marginBottom: 15 }}>
            💡 使用说明
          </h3>
          <ol style={{ color: "#aaa", fontSize: 16, lineHeight: 1.8 }}>
            <li>点击上方按钮上传你的视频和音频文件</li>
            <li>
              <strong style={{ color: "#2ecc71" }}>
                支持大文件上传
              </strong>
              （使用 IndexedDB 存储）
            </li>
            <li>上传成功后，页面会自动刷新</li>
            <li>切换到 "Bike" 组件</li>
            <li>在右侧面板的下拉菜单中直接选择你上传的素材</li>
            <li>输入文案内容，调整音量，预览效果</li>
            <li>
              默认使用 mtb-default 和 gaspedal-default（需要放在 public
              文件夹）
            </li>
            <li>
              上传的素材会保存在浏览器的 IndexedDB 中，清除浏览器数据后会丢失
            </li>
          </ol>
        </div>
      </div>
    </AbsoluteFill>
  );
};
