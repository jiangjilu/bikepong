import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { BikeComposition } from "./Bike/BikeComposition";
import { AssetManager } from "./Bike/AssetManager";
import {
  TableMeme,
  tableMemeSchema,
  calculateTableMemeMetadata,
} from "./TableMeme";
import { WhipWord, whipWordSchema, calculateWhipWordMetadata } from "./WhipWord";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />
      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
      {/* 素材管理中心 - 上传和管理视频音频素材 */}
      <Composition
        id="AssetManager"
        component={AssetManager}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Bike Composition - 带素材库和字幕的视频（动态加载素材） */}
      <BikeComposition />
      {/* Table Meme - 可配置的梗图动画模板 */}
      <Composition
        id="TableMeme"
        component={TableMeme}
        durationInFrames={240} // 默认4秒 @ 60fps，会根据视频自动调整
        fps={60}
        width={1080}
        height={1920}
        schema={tableMemeSchema}
        calculateMetadata={calculateTableMemeMetadata}
        defaultProps={{
          questionPrefix: "老师问",
          highlightWord: "table",
          questionSuffix: "是什么？",
          smartStudentLabel: "学霸：",
          smartStudentAnswer: "桌子",
          smartStudentMedia: "images/table.jpg",
          smartStudentMediaType: "image" as const,
          smartStudentSfx: "audios/magic.mp3",
          myLabel: "我：",
          myMedia: "videos/table.mp4",
          myMediaType: "video" as const,
          mySfx: "audios/alert.mp3",
          sfxVolume: 1,
        }}
      />
      {/* MTB Whip - 单词学习动画：whip的双重含义 */}
      <Composition
        id="MTB-Whip"
        component={WhipWord}
        durationInFrames={240} // 默认4秒 @ 60fps，会根据视频自动调整
        fps={60}
        width={1080}
        height={1920}
        schema={whipWordSchema}
        calculateMetadata={calculateWhipWordMetadata}
        defaultProps={{
          word: "whip",
          backgroundColor1: "#1a1a2e",
          backgroundColor2: "#16213e",
          accentColor: "#e94560",
          bgMusic: "audios/GasPedal.mp3",
          musicVolume: 0.3,
          whipVideo: "videos/MTB-whip.mp4",
          whipVideoVolume: 0.8,
        }}
      />
    </>
  );
};
