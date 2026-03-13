import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile, Easing, Sequence, CalculateMetadataFunction } from "remotion";
import { Audio, Video } from "@remotion/media";
import { z } from "zod";
import { getVideoDuration } from "./getVideoDuration";

export const whipWordSchema = z.object({
  word: z.string().default("whip"),
  backgroundColor1: z.string().default("#1a1a2e"),
  backgroundColor2: z.string().default("#16213e"),
  accentColor: z.string().default("#e94560"),
  bgMusic: z.string().default("audios/GasPedal.mp3"),
  musicVolume: z.number().default(0.3),
  whipVideo: z.string().default("videos/MTB-whip.mp4"),
  whipVideoVolume: z.number().default(0.8),
});

// 动态计算总时长
export const calculateWhipWordMetadata: CalculateMetadataFunction<
  z.infer<typeof whipWordSchema>
> = async ({ props }) => {
  const animationDuration = 240; // 4秒动画 @ 60fps
  const fps = 60;

  try {
    // 获取视频时长
    const videoSrc = staticFile(props.whipVideo);
    const videoDurationInSeconds = await getVideoDuration(videoSrc);
    const videoDurationInFrames = Math.ceil(videoDurationInSeconds * fps);

    // 总时长 = 动画时长 + 视频时长
    const totalDuration = animationDuration + videoDurationInFrames;

    return {
      durationInFrames: totalDuration,
    };
  } catch (error) {
    console.error("Error calculating metadata:", error);
    // 如果获取失败，使用默认时长（4秒动画 + 3秒视频）
    return {
      durationInFrames: animationDuration + 180,
    };
  }
};

export const WhipWord: React.FC<z.infer<typeof whipWordSchema>> = ({
  word,
  backgroundColor1,
  backgroundColor2,
  accentColor,
  bgMusic,
  musicVolume,
  whipVideo,
  whipVideoVolume,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 动画部分固定为4秒（240帧 @ 60fps）
  const animationDuration = 240;
  
  // 场景切换点：2秒（总时长4秒）
  const switchFrame = fps * 2;
  
  // 视频开始帧 = 动画结束后
  const videoStartFrame = animationDuration;

  // 3D透视效果
  const perspective = 1200;

  // 第一场景：单词原意（鞭子）- 带3D缩放和旋转运镜
  const scene1Scale = interpolate(
    frame,
    [0, switchFrame - 20, switchFrame],
    [1.2, 1, 0.8],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    }
  );

  const scene1RotateX = interpolate(
    frame,
    [0, 30, switchFrame - 20, switchFrame],
    [15, 0, 0, -20],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    }
  );

  const scene1RotateY = interpolate(
    frame,
    [0, switchFrame],
    [0, -15],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    }
  );

  const scene1Opacity = interpolate(frame, [switchFrame - 15, switchFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scene1Blur = interpolate(frame, [switchFrame - 15, switchFrame], [0, 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 第二场景：山地自行车甩尾 - 带3D旋转和缩放运镜
  const scene2Scale = spring({
    frame: frame - switchFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const scene2RotateX = interpolate(
    frame,
    [switchFrame, switchFrame + 20, switchFrame + 40],
    [30, -10, 0],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.exp),
    }
  );

  const scene2RotateY = interpolate(
    frame,
    [switchFrame, switchFrame + 30],
    [25, 0],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.exp),
    }
  );

  const scene2RotateZ = interpolate(
    frame,
    [switchFrame, switchFrame + 25],
    [-10, 0],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.exp),
    }
  );

  const scene2Opacity = interpolate(frame, [switchFrame, switchFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 单词标题动画 - 3D弹性进入
  const titleSpring = spring({
    frame: frame,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  const titleRotateY = interpolate(frame, [0, 20], [-90, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });

  // 闪光效果 - 在转场时
  const flashOpacity = interpolate(
    frame,
    [switchFrame - 2, switchFrame, switchFrame + 2],
    [0, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 粒子效果时间
  const particlesActive = frame >= switchFrame - 10 && frame <= switchFrame + 20;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${backgroundColor1} 0%, ${backgroundColor2} 100%)`,
        fontFamily: "Arial, sans-serif",
        perspective: `${perspective}px`,
      }}
    >
      {/* 背景音乐 */}
      <Audio src={staticFile(bgMusic)} volume={musicVolume} />

      {/* 动态背景粒子效果 */}
      {particlesActive && <ParticleEffect frame={frame} switchFrame={switchFrame} />}

      {/* 闪光转场效果 */}
      <AbsoluteFill
        style={{
          backgroundColor: "#ffffff",
          opacity: flashOpacity,
          mixBlendMode: "screen",
        }}
      />

      {/* 场景1：鞭子的原意 */}
      <AbsoluteFill
        style={{
          opacity: scene1Opacity,
          transform: `scale(${scene1Scale}) rotateX(${scene1RotateX}deg) rotateY(${scene1RotateY}deg)`,
          transformStyle: "preserve-3d",
          filter: `blur(${scene1Blur}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 60,
            transformStyle: "preserve-3d",
            height: "100%",
          }}
        >
          {/* 聚光灯效果 */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "600px",
              height: "600px",
              background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
              opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
            }}
          />

          {/* 单词标题 - 3D翻转进入 */}
          <div
            style={{
              fontSize: 100,
              fontWeight: "bold",
              color: accentColor,
              marginBottom: 30,
              transform: `scale(${titleSpring}) rotateY(${titleRotateY}deg) translateZ(50px)`,
              transformStyle: "preserve-3d",
              textShadow: `0 0 30px ${accentColor}88, 0 0 60px ${accentColor}44`,
              letterSpacing: "0.1em",
            }}
          >
            {word.toUpperCase()}
          </div>

          {/* 音标和词性 - 3D层次 */}
          <div
            style={{
              fontSize: 36,
              color: "#ffffff",
              marginBottom: 40,
              opacity: interpolate(frame, [8, 15], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [8, 20], [20, 0], { extrapolateRight: "clamp" })}px) translateZ(30px)`,
              transformStyle: "preserve-3d",
            }}
          >
            /wɪp/ • n. & v.
          </div>

          {/* 鞭子图示 - 3D浮动 */}
          <div
            style={{
              transform: `translateZ(40px) rotateX(${interpolate(frame, [20, 60], [0, 5], { extrapolateRight: "clamp" })}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <WhipIllustration frame={frame} accentColor={accentColor} />
          </div>

          {/* 释义 - 3D层次 */}
          <div
            style={{
              fontSize: 42,
              color: "#ffffff",
              textAlign: "center",
              marginTop: 40,
              opacity: interpolate(frame, [15, 25], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [15, 30], [30, 0], { extrapolateRight: "clamp" })}px) translateZ(20px)`,
              transformStyle: "preserve-3d",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            鞭子 • 鞭打
          </div>
        </div>
      </AbsoluteFill>

      {/* 场景2：山地自行车甩尾 */}
      <AbsoluteFill
        style={{
          opacity: scene2Opacity,
          transform: `scale(${scene2Scale}) rotateX(${scene2RotateX}deg) rotateY(${scene2RotateY}deg) rotateZ(${scene2RotateZ}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 60,
            transformStyle: "preserve-3d",
            height: "100%",
          }}
        >
          {/* 动态光晕背景 */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "800px",
              height: "800px",
              background: `radial-gradient(circle, #ffd70033 0%, transparent 70%)`,
              opacity: interpolate(frame, [switchFrame + 10, switchFrame + 30], [0, 1], { extrapolateRight: "clamp" }),
            }}
          />

          {/* 惊喜标题 - 3D弹出 */}
          <div
            style={{
              fontSize: 56,
              fontWeight: "bold",
              color: "#ffd700",
              marginBottom: 30,
              transform: `scale(${interpolate(frame, [switchFrame, switchFrame + 10], [0.5, 1], { extrapolateRight: "clamp" })}) translateZ(60px)`,
              transformStyle: "preserve-3d",
              textShadow: "0 0 40px #ffd70088, 0 4px 30px rgba(0,0,0,0.5)",
              letterSpacing: "0.05em",
            }}
          >
            但在山地自行车中...
          </div>

          {/* 自行车甩尾图示 - 3D旋转 */}
          <div
            style={{
              transform: `translateZ(80px) rotateY(${interpolate(frame, [switchFrame, switchFrame + 40], [15, 0], { extrapolateRight: "clamp" })}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <BikeWhipIllustration frame={frame - switchFrame} accentColor={accentColor} />
          </div>

          {/* 连接提示 - 展示鞭子与甩尾的关联 */}
          <div
            style={{
              fontSize: 28,
              color: "#ffd700",
              textAlign: "center",
              marginTop: 20,
              opacity: interpolate(frame, [switchFrame + 25, switchFrame + 35], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateZ(45px)`,
              transformStyle: "preserve-3d",
              fontStyle: "italic",
              textShadow: "0 2px 15px rgba(0,0,0,0.5)",
            }}
          >
            ↑ 像鞭子一样挥动车身
          </div>

          {/* 新释义 - 带强调效果和3D层次 */}
          <div
            style={{
              fontSize: 48,
              color: "#ffffff",
              textAlign: "center",
              marginTop: 40,
              fontWeight: "bold",
              opacity: interpolate(frame, [switchFrame + 10, switchFrame + 20], [0, 1], { extrapolateRight: "clamp" }),
              transform: `scale(${interpolate(frame, [switchFrame + 10, switchFrame + 25], [0.8, 1], { 
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.exp),
              })}) translateZ(50px)`,
              transformStyle: "preserve-3d",
              textShadow: `0 0 30px ${accentColor}88, 0 4px 20px rgba(0,0,0,0.7)`,
            }}
          >
            WHIP = 甩尾动作 🚵
          </div>

          <div
            style={{
              fontSize: 32,
              color: "#cccccc",
              textAlign: "center",
              marginTop: 20,
              opacity: interpolate(frame, [switchFrame + 20, switchFrame + 30], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [switchFrame + 20, switchFrame + 35], [20, 0], { extrapolateRight: "clamp" })}px) translateZ(30px)`,
              transformStyle: "preserve-3d",
              textShadow: "0 2px 15px rgba(0,0,0,0.5)",
            }}
          >
            在空中横向摆动车身的炫酷技巧
          </div>
        </div>
      </AbsoluteFill>

      {/* 场景3：真实甩尾视频 */}
      <Sequence from={videoStartFrame}>
        <AbsoluteFill>
          <Video
            src={staticFile(whipVideo)}
            volume={whipVideoVolume}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          
          {/* 视频标题叠加 */}
          <div
            style={{
              position: "absolute",
              top: 80,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 48,
              fontWeight: "bold",
              color: "#ffffff",
              textShadow: "0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)",
              opacity: interpolate(frame, [videoStartFrame, videoStartFrame + 20], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [videoStartFrame, videoStartFrame + 30], [-20, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            真实的 WHIP 动作 🔥
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// 粒子效果组件
const ParticleEffect: React.FC<{ frame: number; switchFrame: number }> = ({ frame, switchFrame }) => {
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const distance = interpolate(
      frame,
      [switchFrame - 10, switchFrame + 10],
      [0, 300],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.exp),
      }
    );
    const opacity = interpolate(
      frame,
      [switchFrame - 10, switchFrame, switchFrame + 10],
      [0, 1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    return {
      x: 540 + Math.cos(angle) * distance,
      y: 960 + Math.sin(angle) * distance,
      opacity,
      size: 4 + (i % 3) * 2,
    };
  });

  return (
    <AbsoluteFill>
      <svg width="1080" height="1920">
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill="#ffd700"
            opacity={p.opacity}
            style={{
              filter: "blur(2px)",
            }}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// 鞭子插图组件
// 鞭子插图组件
const WhipIllustration: React.FC<{ frame: number; accentColor: string }> = ({ frame, accentColor }) => {
  const whipAnimation = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  // 鞭子发光效果
  const glowIntensity = interpolate(whipAnimation, [0.3, 0.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg width="350" height="250" viewBox="0 0 400 300">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 鞭子手柄 */}
      <rect x="50" y="140" width="80" height="20" fill={accentColor} rx="10" filter="url(#glow)" />
      
      {/* 手柄纹理 */}
      <line x1="70" y1="140" x2="70" y2="160" stroke="#ffffff" strokeWidth="2" opacity="0.3" />
      <line x1="85" y1="140" x2="85" y2="160" stroke="#ffffff" strokeWidth="2" opacity="0.3" />
      <line x1="100" y1="140" x2="100" y2="160" stroke="#ffffff" strokeWidth="2" opacity="0.3" />
      <line x1="115" y1="140" x2="115" y2="160" stroke="#ffffff" strokeWidth="2" opacity="0.3" />
      
      {/* 鞭子绳索 - 带动画和发光 */}
      <path
        d={`M 130 150 Q 200 ${150 - whipAnimation * 80} 280 ${150 + whipAnimation * 60} T 350 ${180 - whipAnimation * 40}`}
        stroke={accentColor}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        filter="url(#glow)"
        opacity={0.9 + glowIntensity * 0.1}
      />
      
      {/* 鞭梢 */}
      <circle
        cx={350}
        cy={180 - whipAnimation * 40}
        r="8"
        fill="#ffd700"
        opacity={interpolate(whipAnimation, [0.5, 1], [0.3, 1])}
        filter="url(#glow)"
      />
      
      {/* 运动线条效果 - 增强 */}
      {whipAnimation > 0.3 && (
        <>
          <line
            x1="280"
            y1={150 + whipAnimation * 60}
            x2="250"
            y2={150 + whipAnimation * 60 - 25}
            stroke="#ffffff"
            strokeWidth="3"
            opacity={0.6 * glowIntensity}
            strokeLinecap="round"
          />
          <line
            x1="300"
            y1={150 + whipAnimation * 60}
            x2="270"
            y2={150 + whipAnimation * 60 - 20}
            stroke="#ffffff"
            strokeWidth="3"
            opacity={0.5 * glowIntensity}
            strokeLinecap="round"
          />
          <line
            x1="320"
            y1={160 - whipAnimation * 20}
            x2="290"
            y2={160 - whipAnimation * 20 - 15}
            stroke="#ffffff"
            strokeWidth="2"
            opacity={0.4 * glowIntensity}
            strokeLinecap="round"
          />
        </>
      )}
      
      {/* 冲击波效果 */}
      {whipAnimation > 0.6 && (
        <circle
          cx={350}
          cy={180 - whipAnimation * 40}
          r={20 * (whipAnimation - 0.6) * 2.5}
          stroke="#ffd700"
          strokeWidth="2"
          fill="none"
          opacity={(1 - whipAnimation) * 2}
        />
      )}
    </svg>
  );
};

// 自行车甩尾插图组件
// 自行车甩尾插图组件
// 自行车甩尾插图组件
const BikeWhipIllustration: React.FC<{ frame: number; accentColor: string }> = ({ frame, accentColor }) => {
  const bikeRotation = interpolate(frame, [0, 30, 60], [0, 25, 15], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  const bikeY = interpolate(frame, [0, 15, 30, 60], [0, -50, -40, -30], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  // 车轮旋转
  const wheelRotation = (frame * 15) % 360;

  // 尾迹效果
  const trailOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 鞭子轨迹动画 - 模拟甩尾与鞭子挥动的相似性
  const whipTrailProgress = interpolate(frame, [15, 45], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  return (
    <svg width="450" height="300" viewBox="0 0 500 350">
      <defs>
        <filter id="bikeglow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="wheelGradient">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor="#ffffff" />
        </radialGradient>
        <linearGradient id="whipTrailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 鞭子式轨迹线 - 展示甩尾与鞭子挥动的相似性 */}
      {whipTrailProgress > 0 && (
        <>
          {/* 主鞭子轨迹 - 模拟鞭子的S形曲线 */}
          <path
            d={`M -100 ${80 + whipTrailProgress * 20} Q ${-50 + whipTrailProgress * 50} ${60 - whipTrailProgress * 40} ${50 + whipTrailProgress * 100} ${80 + whipTrailProgress * 30} T ${200 + whipTrailProgress * 50} ${70 - whipTrailProgress * 20}`}
            stroke="url(#whipTrailGradient)"
            strokeWidth={6 - whipTrailProgress * 2}
            fill="none"
            strokeLinecap="round"
            opacity={trailOpacity * (1 - whipTrailProgress * 0.3)}
            filter="url(#bikeglow)"
          />
          
          {/* 鞭梢效果 - 在轨迹末端 */}
          <circle
            cx={200 + whipTrailProgress * 50}
            cy={70 - whipTrailProgress * 20}
            r={4 + whipTrailProgress * 3}
            fill="#ffd700"
            opacity={trailOpacity * 0.8}
            filter="url(#bikeglow)"
          />
          
          {/* 鞭子式能量波纹 */}
          {whipTrailProgress > 0.5 && (
            <>
              <path
                d={`M ${100 + whipTrailProgress * 80} ${75 - whipTrailProgress * 15} Q ${150 + whipTrailProgress * 60} ${65 - whipTrailProgress * 25} ${200 + whipTrailProgress * 50} ${70 - whipTrailProgress * 20}`}
                stroke={accentColor}
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,8"
                opacity={(whipTrailProgress - 0.5) * trailOpacity}
                filter="url(#bikeglow)"
              />
            </>
          )}
        </>
      )}

      {/* 运动轨迹线 - 增强 */}
      <path
        d="M -150 80 Q -100 60 -50 70 T 0 75"
        stroke="#ffd700"
        strokeWidth="4"
        fill="none"
        strokeDasharray="8,8"
        opacity={trailOpacity * 0.8}
        filter="url(#bikeglow)"
      />

      {/* 速度线 - 多层 */}
      {frame > 20 && (
        <>
          <line x1="-180" y1="20" x2="-140" y2="20" stroke="#ffffff" strokeWidth="4" opacity={0.6 * trailOpacity} strokeLinecap="round" />
          <line x1="-180" y1="40" x2="-130" y2="40" stroke="#ffffff" strokeWidth="4" opacity={0.5 * trailOpacity} strokeLinecap="round" />
          <line x1="-180" y1="60" x2="-120" y2="60" stroke="#ffffff" strokeWidth="4" opacity={0.4 * trailOpacity} strokeLinecap="round" />
          <line x1="-180" y1="80" x2="-125" y2="80" stroke="#ffffff" strokeWidth="3" opacity={0.3 * trailOpacity} strokeLinecap="round" />
        </>
      )}

      <g transform={`translate(250, ${200 + bikeY}) rotate(${bikeRotation})`}>
        {/* 自行车车架 */}
        <g transform="translate(-100, 0)">
          {/* 后轮 - 带旋转和发光 */}
          <g transform={`rotate(${wheelRotation} 20 50)`}>
            <circle cx="20" cy="50" r="35" stroke="url(#wheelGradient)" strokeWidth="5" fill="none" filter="url(#bikeglow)" />
            <line x1="20" y1="15" x2="20" y2="85" stroke={accentColor} strokeWidth="3" opacity="0.6" />
            <line x1="-15" y1="50" x2="55" y2="50" stroke={accentColor} strokeWidth="3" opacity="0.6" />
          </g>
          <circle cx="20" cy="50" r="6" fill={accentColor} filter="url(#bikeglow)" />
          
          {/* 前轮 - 带旋转和发光 */}
          <g transform={`rotate(${wheelRotation} 180 50)`}>
            <circle cx="180" cy="50" r="35" stroke="url(#wheelGradient)" strokeWidth="5" fill="none" filter="url(#bikeglow)" />
            <line x1="180" y1="15" x2="180" y2="85" stroke={accentColor} strokeWidth="3" opacity="0.6" />
            <line x1="145" y1="50" x2="215" y2="50" stroke={accentColor} strokeWidth="3" opacity="0.6" />
          </g>
          <circle cx="180" cy="50" r="6" fill={accentColor} filter="url(#bikeglow)" />
          
          {/* 车架 - 增强 */}
          <line x1="20" y1="50" x2="80" y2="10" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" filter="url(#bikeglow)" />
          <line x1="80" y1="10" x2="140" y2="10" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" filter="url(#bikeglow)" />
          <line x1="140" y1="10" x2="180" y2="50" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" filter="url(#bikeglow)" />
          <line x1="80" y1="10" x2="80" y2="50" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" filter="url(#bikeglow)" />
          <line x1="80" y1="50" x2="20" y2="50" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" filter="url(#bikeglow)" />
          
          {/* 座椅 */}
          <ellipse cx="85" cy="9" rx="18" ry="5" fill={accentColor} filter="url(#bikeglow)" />
          
          {/* 车把 */}
          <line x1="140" y1="10" x2="150" y2="-2" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
          <line x1="143" y1="-2" x2="157" y2="-2" stroke={accentColor} strokeWidth="5" strokeLinecap="round" filter="url(#bikeglow)" />
        </g>
        
        {/* 甩尾粒子效果 */}
        {frame > 15 && (
          <>
            <circle cx="-120" cy="60" r="4" fill="#ffd700" opacity={0.8 * trailOpacity} filter="url(#bikeglow)" />
            <circle cx="-100" cy="55" r="3" fill="#ffd700" opacity={0.6 * trailOpacity} filter="url(#bikeglow)" />
            <circle cx="-80" cy="58" r="5" fill="#ffd700" opacity={0.7 * trailOpacity} filter="url(#bikeglow)" />
            <circle cx="-130" cy="70" r="3" fill={accentColor} opacity={0.5 * trailOpacity} />
          </>
        )}
      </g>
      
      {/* 地面阴影 */}
      <ellipse
        cx="250"
        cy="280"
        rx={80 + bikeY * 0.5}
        ry={20 - bikeY * 0.3}
        fill="#000000"
        opacity={0.2}
      />
      
      {/* 地面 */}
      <line x1="0" y1="280" x2="500" y2="280" stroke="#ffffff" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
    </svg>
  );
};
