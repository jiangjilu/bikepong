import React, { useState } from "react";
import { Bike, BikeProps } from "./index";
import { AssetUploader } from "./AssetUploader";
import { assetsLibrary } from "./assets";

/**
 * 带素材上传功能的 Bike 组件示例
 * 这个组件展示了如何在实际应用中集成素材上传功能
 */
export const BikeWithUploader: React.FC<BikeProps> = (props) => {
  const [, forceUpdate] = useState({});

  const handleAssetAdded = () => {
    // 强制更新组件以显示新添加的素材
    forceUpdate({});
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* 素材上传区域 */}
      <div style={{ padding: "20px", backgroundColor: "#fff" }}>
        <AssetUploader onAssetAdded={handleAssetAdded} />
      </div>

      {/* 视频预览区域 */}
      <div style={{ flex: 1, position: "relative" }}>
        <Bike {...props} />
      </div>

      {/* 素材信息显示 */}
      <div
        style={{
          padding: "10px 20px",
          backgroundColor: "#f9f9f9",
          borderTop: "1px solid #ddd",
        }}
      >
        <small>
          当前素材库: {assetsLibrary.videos.length} 个视频,{" "}
          {assetsLibrary.audios.length} 个音频
        </small>
      </div>
    </div>
  );
};
