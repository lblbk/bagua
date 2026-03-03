import React from 'react';
import SingleCoin from './SingleCoin'; // 假设 SingleCoin 还在 components 目录下

const CoinStage = ({ coinRefs, onStopComplete }) => {
  return (
    <div className="flex justify-center gap-6 w-full py-4">
      {[0, 1, 2].map(i => (
        <SingleCoin 
          key={i} 
          index={i} 
          ref={coinRefs[i]} // 直接传入对应的 ref
          onStopComplete={onStopComplete} 
        />
      ))}
    </div>
  );
};

export default CoinStage;