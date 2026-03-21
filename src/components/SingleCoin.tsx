import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { View, Image } from "@tarojs/components";
import constants from "../data/constants.json";

import IMG_HEADS from "../assets/head.svg";
import IMG_TAILS from "../assets/tail.svg";

// 强制限定尺寸，绝不会再变大
const COIN_SIZE = "70px";

// 强制全部内联样式，杜绝 Taro 外部 CSS 丢失导致布局崩塌
const styles: Record<string, React.CSSProperties> = {
  scene: {
    width: COIN_SIZE,
    height: COIN_SIZE,
    perspective: "1000px",
    WebkitPerspective: "1000px",
    position: "relative",
    flexShrink: 0, // 确保在 flex 布局中不被挤压
  },
  coin: {
    width: "100%",
    height: "100%",
    position: "relative",
    transformStyle: "preserve-3d",
    WebkitTransformStyle: "preserve-3d",
  },
  face: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: "50%",
  },
  image: {
    width: "100%",
    height: "100%",
    display: "block",
  },
};

const SingleCoin = forwardRef(({ onStopComplete, index }: any, ref) => {
  const { coin: t } = constants;

  const [dynamicStyle, setDynamicStyle] = useState({
    transform: "rotateY(0deg)",
    transition: "none",
  });

  const angleRef = useRef(0);
  const rafRef = useRef<any>(null);
  const lastTimeRef = useRef(0);
  const speedFactor = useRef(1.5 + Math.random() * 0.8);
  const currentRoundIdRef = useRef<number | null>(null);
  const stopDelayTimerRef = useRef<any>(null);
  const animationCompleteTimerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    startSpin: (roundId: number) => {
      if (stopDelayTimerRef.current) clearTimeout(stopDelayTimerRef.current);
      if (animationCompleteTimerRef.current)
        clearTimeout(animationCompleteTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      currentRoundIdRef.current = roundId;

      setDynamicStyle({
        transform: `rotateY(${angleRef.current % 360}deg)`,
        transition: "none",
      });
      lastTimeRef.current = 0;

      const loop = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const delta = time - lastTimeRef.current;
        lastTimeRef.current = time;
        angleRef.current += speedFactor.current * delta;
        if (angleRef.current > 36000) angleRef.current -= 36000;
        setDynamicStyle((prev) => ({
          ...prev,
          transform: `rotateY(${angleRef.current}deg)`,
        }));
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    },

    stopSpin: (quickMode = false) => {
      const maxDelay = quickMode ? 300 : 800;
      const randomDelay = Math.random() * maxDelay;

      stopDelayTimerRef.current = setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        const brakingSpins = 1440 + Math.random() * 720;
        const rawStopAngle = angleRef.current + brakingSpins;
        const finalAngle = Math.round(rawStopAngle / 180) * 180;
        angleRef.current = finalAngle;

        const result = (finalAngle / 180) % 2 === 0 ? t.heads : t.tails;
        const duration = 2.0 + Math.random() * 0.8;

        setDynamicStyle({
          transition: `transform ${duration}s cubic-bezier(0.15, 1, 0.3, 1)`,
          transform: `rotateY(${finalAngle}deg)`,
        });

        animationCompleteTimerRef.current = setTimeout(() => {
          if (currentRoundIdRef.current !== null) {
            onStopComplete(index, result, currentRoundIdRef.current);
          }
        }, duration * 1000);
      }, randomDelay);
    },
  }));

  return (
    <View style={styles.scene}>
      <View style={{ ...styles.coin, ...dynamicStyle }}>
        {/* 正面（字面）: 彻底删除 z-index，使用 translateZ(1px) 将其在 3D 空间向前推 1 像素 */}
        <View
          style={{ ...styles.face, transform: "rotateY(0deg) translateZ(1px)" }}
        >
          <Image src={IMG_HEADS} style={styles.image} mode="aspectFit" />
        </View>

        {/* 背面（花面）: 使用 translateZ(1px) 结合 rotateY(180deg)，在 3D 空间向后推 1 像素 */}
        <View
          style={{
            ...styles.face,
            transform: "rotateY(180deg) translateZ(1px)",
          }}
        >
          <Image src={IMG_TAILS} style={styles.image} mode="aspectFit" />
        </View>
      </View>
    </View>
  );
});

SingleCoin.displayName = "SingleCoin";

export default SingleCoin;
