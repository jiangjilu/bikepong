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
  useVideoConfig,
} from "remotion";
import { getVideoMetadata } from "@remotion/media-utils";

// Props Schema - 可配置的参数
export const tableMemeSchema = z.object({
  // 问题部分
  questionPrefix: z.string().default("老师问"),
  highlightWord: z.string().default("table"),
  questionSuffix: z.string().default("是什么？"),
  
  // 学霸回答
  smartStudentLabel: z.string().default("学霸："),
  smartStudentAnswer: z.string().default("桌子"),
  smartStudentMedia: z.string().default("images/table.jpg"), // 图片或视频路径
  smartStudentMediaType: z.enum(["image", "video"]).default("image"),
  smartStudentSfx: z.string().default("audios/magic.mp3"), // 音效
  
  // 我的回答
  myLabel: z.string().default("我："),
  myMedia: z.string().default("videos/table.mp4"), // 图片或视频路径
  myMediaType: z.enum(["image", "video"]).default("video"),
  mySfx: z.string().default("audios/alert.mp3"), // 音效
  
  // 音量控制
  sfxVolume: z.number().min(0).max(1).default(0.5),
});

export type TableMemeProps = z.infer<typeof tableMemeSchema>;

// 计算视频元数据 - 根据素材时长动态调整总时长
export const calculateTableMemeMetadata = async ({
  props,
}: {
  props: TableMemeProps;
}) => {
  const fps = 60;
  const MIN_ANSWER_DURATION = 60; // 最少1秒
  
  // 前面固定部分：0.5s(问题) + 0.5s(学霸文字) + 1s(学霸图片) + 1s("我："标签) = 3秒
  const FIXED_DURATION = 180; // 3秒 @ 60fps
  
  let answerDuration = MIN_ANSWER_DURATION; // 默认1秒
  
  // 如果是视频类型，获取视频时长
  if (props.myMediaType === "video") {
    try {
      const videoMetadata = await getVideoMetadata(staticFile(props.myMedia));
      const videoDurationInFrames = Math.ceil(videoMetadata.durationInSeconds * fps);
      
      // 如果视频超过1秒，使用视频时长；否则保持1秒
      if (videoDurationInFrames > MIN_ANSWER_DURATION) {
        answerDuration = videoDurationInFrames;
      }
    } catch (error) {
      console.warn("无法获取视频时长，使用默认1秒:", error);
    }
  }
  
  const totalDuration = FIXED_DURATION + answerDuration;
  
  return {
    durationInFrames: totalDuration,
    fps,
  };
};

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
  const { durationInFrames } = useVideoConfig();

  // 时间轴设置（以帧为单位，60fps）
  const QUESTION_START = 0;
  const QUESTION_DURATION = 30; // 0.5秒 - 只显示问题
  
  const SMART_TEXT_START = QUESTION_DURATION;
  const SMART_TEXT_DURATION = 30; // 0.5秒 - 学霸文字回答
  
  const SMART_IMAGE_START = SMART_TEXT_START + SMART_TEXT_DURATION;
  const SMART_IMAGE_DURATION = 60; // 1秒 - 学霸图片
  
  const MY_LABEL_START = SMART_IMAGE_START + SMART_IMAGE_DURATION;
  const MY_LABEL_DURATION = 60; // 1秒 - 只显示"我："
  
  const MY_ANSWER_START = MY_LABEL_START + MY_LABEL_DURATION;
  // 动态计算"我的回答"时长：总时长 - 前面固定的3秒
  const MY_ANSWER_DURATION = durationInFrames - (QUESTION_DURATION + SMART_TEXT_DURATION + SMART_IMAGE_DURATION + MY_LABEL_DURATION);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 第一部分：问题 - 默认显示 */}
      <Sequence from={QUESTION_START} durationInFrames={QUESTION_DURATION + SMART_TEXT_DURATION + SMART_IMAGE_DURATION + MY_LABEL_DURATION + MY_ANSWER_DURATION}>
        <QuestionSection
          prefix={questionPrefix}
          highlight={highlightWord}
          suffix={questionSuffix}
        />
      </Sequence>

      {/* 第二部分：学霸文字回答 - 0.5秒后出现 */}
      <Sequence from={SMART_TEXT_START} durationInFrames={SMART_TEXT_DURATION + SMART_IMAGE_DURATION + MY_LABEL_DURATION + MY_ANSWER_DURATION}>
        <SmartStudentText
          label={smartStudentLabel}
          answer={smartStudentAnswer}
          sfx={smartStudentSfx}
          sfxVolume={sfxVolume}
        />
      </Sequence>

      {/* 第三部分：学霸图片 - 再0.5秒后出现 */}
      <Sequence from={SMART_IMAGE_START} durationInFrames={SMART_IMAGE_DURATION + MY_LABEL_DURATION + MY_ANSWER_DURATION}>
        <SmartStudentImage
          media={smartStudentMedia}
          mediaType={smartStudentMediaType}
        />
      </Sequence>

      {/* 第四部分：只显示"我："标签 - 再1秒后 */}
      <Sequence from={MY_LABEL_START} durationInFrames={MY_LABEL_DURATION + MY_ANSWER_DURATION}>
        <MyLabelOnly label={myLabel} />
      </Sequence>

      {/* 第五部分：我的回答媒体内容 - 再1秒后 */}
      <Sequence from={MY_ANSWER_START} durationInFrames={MY_ANSWER_DURATION}>
        <MyAnswerMedia
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

// 学霸文字回答组件 - 只显示文字
const SmartStudentText: React.FC<{
  label: string;
  answer: string;
  sfx: string;
  sfxVolume: number;
}> = ({ label, answer, sfx, sfxVolume }) => {
  return (
    <>
      {/* 音效 */}
      {sfx && (
        <Audio src={staticFile(sfx)} volume={sfxVolume} startFrom={0} />
      )}
      
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          right: "10%",
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
      </div>
    </>
  );
};

// 学霸图片组件 - 只显示图片
const SmartStudentImage: React.FC<{
  media: string;
  mediaType: "image" | "video";
}> = ({ media, mediaType }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "15%",
        left: "10%",
        right: "10%",
      }}
    >
      {/* 占位文字（不可见，用于保持布局） */}
      <div
        style={{
          fontSize: "63px",
          color: "transparent",
          marginBottom: "20px",
        }}
      >
        学霸：桌子
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
  );
};

// 只显示"我："标签 - 制造悬念
const MyLabelOnly: React.FC<{
  label: string;
}> = ({ label }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "10%",
        right: "10%",
      }}
    >
      <div
        style={{
          fontSize: "78px",
          fontWeight: "bold",
          color: "#FFD700",
          textShadow: "0 0 20px rgba(255, 215, 0, 0.8)",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// 我的回答媒体内容 - 反转效果
const MyAnswerMedia: React.FC<{
  media: string;
  mediaType: "image" | "video";
  sfx: string;
  sfxVolume: number;
}> = ({ media, mediaType, sfx, sfxVolume }) => {
  const frame = useCurrentFrame();
  
  // 缩放 + 旋转入场动画（60fps，快速有冲击力）
  const scale = interpolate(frame, [0, 40], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  const rotate = interpolate(frame, [0, 40], [-15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* 音效 - 确保播放 */}
      <Audio src={staticFile(sfx)} volume={sfxVolume} />
      
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "10%",
          right: "10%",
        }}
      >
        {/* 标签 - 保持显示 */}
        <div
          style={{
            fontSize: "78px",
            fontWeight: "bold",
            color: "#FFD700",
            marginBottom: "20px",
            textShadow: "0 0 20px rgba(255, 215, 0, 0.8)",
          }}
        >
          我：
        </div>

        {/* 媒体内容 - 动画入场 */}
        <div
          style={{
            width: "100%",
            height: "500px",
            borderRadius: "20px",
            overflow: "hidden",
            border: "6px solid #FFD700",
            boxShadow: "0 0 50px rgba(255, 215, 0, 0.6)",
            transform: `scale(${scale}) rotate(${rotate}deg)`,
            transformOrigin: "left center",
            opacity,
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


