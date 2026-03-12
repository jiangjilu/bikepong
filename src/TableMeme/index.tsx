import { z } from "zod";
import {
  AbsoluteFill,
  staticFile,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
  Audio,
  Img,
  Video,
} from "remotion";

// Props Schema - 可配置的参数
export const tableMemeSchema = z.object({
  // 问题部分
  questionPrefix: z.string().default("老师问"),
  highlightWord: z.string().default("table"),
  questionSuffix: z.string().default("是什么？"),
  
  // 学霸回答
  smartStudentLabel: z.string().default("学霸："),
  smartStudentAnswer: z.string().default("桌子"),
  smartStudentMedia: z.string().default("desk.jpg"), // 图片或视频路径
  smartStudentMediaType: z.enum(["image", "video"]).default("image"),
  smartStudentSfx: z.string().default("magic.mp3"), // 音效
  
  // 我的回答
  myLabel: z.string().default("我："),
  myMedia: z.string().default("videos/MTB.mp4"), // 图片或视频路径
  myMediaType: z.enum(["image", "video"]).default("video"),
  mySfx: z.string().default("audios/GasPedal.mp3"), // 音效
  
  // 音量控制
  sfxVolume: z.number().min(0).max(1).default(0.5),
});

export type TableMemeProps = z.infer<typeof tableMemeSchema>;

export const TableMeme: React.FC<TableMemeProps> = ({
  questionPrefix,
  highlightWord,
  questionSuffix,
  smartStudentLabel,
  smartStudentAnswer,
  smartStudentMedia,
  smartStudentMediaType,
  smartStudentSfx,
  myLabel,
  myMedia,
  myMediaType,
  mySfx,
  sfxVolume,
}) => {

  // 时间轴设置（以帧为单位，60fps）
  const QUESTION_START = 0;
  const QUESTION_DURATION = 120; // 2秒
  
  const SMART_STUDENT_START = QUESTION_DURATION;
  const SMART_STUDENT_DURATION = 180; // 3秒
  
  const MY_ANSWER_START = SMART_STUDENT_START + SMART_STUDENT_DURATION;
  const MY_ANSWER_DURATION = 240; // 4秒

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 第一部分：问题 - 直接显示 */}
      <Sequence from={QUESTION_START} durationInFrames={QUESTION_DURATION + SMART_STUDENT_DURATION + MY_ANSWER_DURATION}>
        <QuestionSection
          prefix={questionPrefix}
          highlight={highlightWord}
          suffix={questionSuffix}
        />
      </Sequence>

      {/* 第二部分：学霸回答 - 淡入显示 */}
      <Sequence from={SMART_STUDENT_START} durationInFrames={SMART_STUDENT_DURATION + MY_ANSWER_DURATION}>
        <SmartStudentSection
          label={smartStudentLabel}
          answer={smartStudentAnswer}
          media={smartStudentMedia}
          mediaType={smartStudentMediaType}
          sfx={smartStudentSfx}
          sfxVolume={sfxVolume}
        />
      </Sequence>

      {/* 第三部分：我的回答 - 重点隆重显示 */}
      <Sequence from={MY_ANSWER_START} durationInFrames={MY_ANSWER_DURATION}>
        <MyAnswerSection
          label={myLabel}
          media={myMedia}
          mediaType={myMediaType}
          sfx={mySfx}
          sfxVolume={sfxVolume}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// 问题部分组件
const QuestionSection: React.FC<{
  prefix: string;
  highlight: string;
  suffix: string;
}> = ({ prefix, highlight, suffix }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "5%",
        left: "10%",
        right: "10%",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "66px",
        fontWeight: "bold",
        color: "#fff",
        flexWrap: "wrap",
      }}
    >
      <span>{prefix}</span>
      <span
        style={{
          backgroundColor: "#FFD700",
          color: "#000",
          padding: "12px 38px",
          borderRadius: "18px",
        }}
      >
        {highlight}
      </span>
      <span>{suffix}</span>
    </div>
  );
};

// 学霸回答组件
const SmartStudentSection: React.FC<{
  label: string;
  answer: string;
  media: string;
  mediaType: "image" | "video";
  sfx: string;
  sfxVolume: number;
}> = ({ label, answer, media, mediaType, sfx, sfxVolume }) => {
  const frame = useCurrentFrame();
  
  // 淡入动画（60fps，调整帧数）
  const opacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [0, 40], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  return (
    <>
      {/* 音效 - 始终渲染，让 Remotion 处理时间轴 */}
      {sfx && (
        <Audio src={staticFile(sfx)} volume={sfxVolume} startFrom={0} />
      )}
      
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          right: "10%",
          transform: `translateY(${translateY}px)`,
          opacity,
        }}
      >
        {/* 标签和答案 - 独立一行 */}
        <div
          style={{
            fontSize: "63px",
            color: "#fff",
            marginBottom: "20px",
          }}
        >
          {label}
          <span style={{ marginLeft: "10px" }}>{answer}</span>
        </div>

        {/* 媒体内容 */}
        <div
          style={{
            width: "100%",
            height: "420px",
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(255, 255, 255, 0.2)",
          }}
        >
          {mediaType === "image" ? (
            <Img
              src={staticFile(media)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Video
              src={staticFile(media)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              muted
            />
          )}
        </div>
      </div>
    </>
  );
};

// 我的回答组件
const MyAnswerSection: React.FC<{
  label: string;
  media: string;
  mediaType: "image" | "video";
  sfx: string;
  sfxVolume: number;
}> = ({ label, media, mediaType, sfx, sfxVolume }) => {
  const frame = useCurrentFrame();
  
  // 缩放 + 旋转入场动画（60fps，调整帧数）
  const scale = interpolate(frame, [0, 60], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  const rotate = interpolate(frame, [0, 60], [-15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* 音效 - 始终渲染，让 Remotion 处理时间轴 */}
      {sfx && (
        <Audio src={staticFile(sfx)} volume={sfxVolume} startFrom={0} />
      )}
      
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "10%",
          right: "10%",
          transform: `scale(${scale}) rotate(${rotate}deg)`,
          transformOrigin: "left center",
          opacity,
        }}
      >
        {/* 标签 - 独立一行 */}
        <div
          style={{
            fontSize: "78px",
            fontWeight: "bold",
            color: "#FFD700",
            marginBottom: "20px",
            textShadow: "0 0 20px rgba(255, 215, 0, 0.8)",
          }}
        >
          {label}
        </div>

        {/* 媒体内容 - 更大更突出，为底部留出空间 */}
        <div
          style={{
            width: "100%",
            height: "500px",
            borderRadius: "20px",
            overflow: "hidden",
            border: "6px solid #FFD700",
            boxShadow: "0 0 50px rgba(255, 215, 0, 0.6)",
          }}
        >
          {mediaType === "image" ? (
            <Img
              src={staticFile(media)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Video
              src={staticFile(media)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              muted={false}
            />
          )}
        </div>
      </div>
    </>
  );
};
