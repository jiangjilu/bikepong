import React, { useState, useRef } from "react";
import { addUserAsset, assetsLibrary } from "./assets";

interface AssetUploaderProps {
  onAssetAdded?: () => void;
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({
  onAssetAdded,
}) => {
  const [uploading, setUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    file: File,
    type: "videos" | "audios",
  ) => {
    setUploading(true);
    try {
      // 创建本地 URL
      const url = URL.createObjectURL(file);

      // 获取媒体时长
      const duration = await getMediaDuration(url, type);

      // 添加到素材库
      const asset = {
        id: `user-${type}-${Date.now()}`,
        name: file.name,
        path: url, // 使用 blob URL
        duration,
      };

      addUserAsset(type, asset);
      onAssetAdded?.();

      alert(`${type === "videos" ? "视频" : "音频"}上传成功: ${file.name}`);
    } catch (error) {
      console.error("上传失败:", error);
      alert("上传失败，请重试");
    } finally {
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

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>素材管理</h3>

      <div style={{ marginBottom: "15px" }}>
        <h4>当前素材库:</h4>
        <div style={{ marginLeft: "10px" }}>
          <p>
            视频: {assetsLibrary.videos.length} 个 (默认: MTB.mp4)
          </p>
          <ul style={{ fontSize: "14px", color: "#666" }}>
            {assetsLibrary.videos.map((v) => (
              <li key={v.id}>{v.name}</li>
            ))}
          </ul>
          <p>
            音频: {assetsLibrary.audios.length} 个 (默认: GasPedal.mp3)
          </p>
          <ul style={{ fontSize: "14px", color: "#666" }}>
            {assetsLibrary.audios.map((a) => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div>
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
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? "上传中..." : "上传视频"}
          </button>
        </div>

        <div>
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
              padding: "10px 20px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? "上传中..." : "上传音频"}
          </button>
        </div>
      </div>

      <p style={{ fontSize: "12px", color: "#999", marginTop: "10px" }}>
        提示: 上传的素材仅在当前会话有效，刷新页面后会恢复默认素材
      </p>
    </div>
  );
};
