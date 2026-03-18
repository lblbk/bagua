import React, { useRef, useImperativeHandle, forwardRef } from 'react';

const IMG_HEADS = `${import.meta.env.BASE_URL}head.svg`;
const IMG_TAILS = `${import.meta.env.BASE_URL}tail.svg`;

const SingleCoin = forwardRef(({ onStopComplete, index }, ref) => {
  const coinDivRef = useRef(null);
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const speedFactor = useRef(1.5 + Math.random() * 0.8);

  // 记录当前的 roundId，防止回调错乱
  const currentRoundIdRef = useRef(null);
  
  // 内部定时器引用，用于强制清理
  const stopDelayTimerRef = useRef(null);
  const animationCompleteTimerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    // startSpin 现在接收 roundId
    startSpin: (roundId) => {
      // 1. 强制清理上一轮可能残留的所有定时器
      if (stopDelayTimerRef.current) clearTimeout(stopDelayTimerRef.current);
      if (animationCompleteTimerRef.current) clearTimeout(animationCompleteTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      // 2. 更新当前轮次ID
      currentRoundIdRef.current = roundId;

      // 3. 重置样式，准备旋转
      if (coinDivRef.current) {
        coinDivRef.current.style.transition = 'none';
      }
      lastTimeRef.current = 0;

      // 4. 启动旋转循环
      const loop = (time) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const delta = time - lastTimeRef.current;
        lastTimeRef.current = time;
        
        angleRef.current += speedFactor.current * delta;
        if (angleRef.current > 36000) angleRef.current -= 36000;

        if (coinDivRef.current) {
          coinDivRef.current.style.transform = `rotateY(${angleRef.current}deg)`;
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    },

    stopSpin: (quickMode = false) => {
      const maxDelay = quickMode ? 300 : 800;
      const randomDelay = Math.random() * maxDelay;

      // 记录定时器 ID 以便清理
      stopDelayTimerRef.current = setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        const brakingSpins = 1440 + Math.random() * 720;
        const rawStopAngle = angleRef.current + brakingSpins;
        const finalAngle = Math.round(rawStopAngle / 180) * 180;
        angleRef.current = finalAngle;

        const result = (finalAngle / 180) % 2 === 0 ? '字' : '花';

        if (coinDivRef.current) {
          const duration = 2.0 + Math.random() * 0.8;
          coinDivRef.current.style.transition = `transform ${duration}s cubic-bezier(0.15, 1, 0.3, 1)`;
          coinDivRef.current.getBoundingClientRect(); 
          coinDivRef.current.style.transform = `rotateY(${finalAngle}deg)`;

          // 记录动画结束定时器
          animationCompleteTimerRef.current = setTimeout(() => {
            // 关键：只有当 ID 匹配时，才汇报结果
            // 这里的 currentRoundIdRef.current 是闭包外的引用，
            // 即使外部快速开启了新一轮，这里也会因为 ID 不匹配而被父组件过滤（双重保险）
            onStopComplete(index, result, currentRoundIdRef.current);
          }, duration * 1000);
        }
      }, randomDelay);
    }
  }));

  return (
    <div className="coin-scene">
      <div className="coin" ref={coinDivRef}>
        <div className="coin-face coin-front">
          <img src={IMG_HEADS} draggable="false" alt="字面" />
        </div>
        <div className="coin-face coin-back">
          <img src={IMG_TAILS} draggable="false" alt="花面" />
        </div>
      </div>
    </div>
  );
});

SingleCoin.displayName = 'SingleCoin';

export default SingleCoin;