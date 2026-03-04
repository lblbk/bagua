// src/utils/divination.js

import divinationData from '../data/divination.json';

const GUA_YAO_CONFIG = divinationData.guaYaoConfig;

const hexagramMap = new Map();
divinationData.hexagramsData.forEach(line => {
  const cleanLine = line.trim();
  if (!cleanLine) return; 

  const [binary, id, name, commonName] = cleanLine.split(',');
  
  hexagramMap.set(binary.trim(), { 
    id: parseInt(id), 
    name: name?.trim(), 
    commonName: commonName?.trim(),
    binary: binary.trim()
  });
});

export const calculateYao = (coinResults, yangSetting) => {
  const valHeads = yangSetting === 'heads' ? 3 : 2;
  const valTails = yangSetting === 'tails' ? 3 : 2;

  let sum = 0;
  coinResults.forEach(r => {
    if (r === '字') sum += valHeads;
    else sum += valTails;
  });

  return GUA_YAO_CONFIG[sum] || { 
    name: '未知', mark: '?', color: 'text-gray-400', type: 'unknown' 
  };
};

export const calculateFinalHexagram = (history) => {
  // 【关键修复】：
  // history 在 App.jsx 中的压入顺序是 [newRecord, ...prev]
  // 也就是第6次摇卦（上爻）在 index 0，第1次摇卦（初爻）在 index 5
  // 这正好和 JSON 中的 "101011" (上爻...初爻) 顺序完美对应。
  // 因此我们直接遍历拼接，不需要 reverse。

  let benGuaBinary = '';
  let zhiGuaBinary = '';
  let hasChangingLine = false;

  history.forEach(yao => {
    const isYang = yao.guaType === 'yang';
    const bit = isYang ? '1' : '0';
    
    benGuaBinary += bit;

    if (yao.guaMark) { 
      zhiGuaBinary += bit === '1' ? '0' : '1'; 
      hasChangingLine = true;
    } else {
      zhiGuaBinary += bit; 
    }
  });

  const benGua = hexagramMap.get(benGuaBinary);
  const zhiGua = hasChangingLine ? hexagramMap.get(zhiGuaBinary) : null;

  if (!benGua) {
    console.error(`未找到对应卦象: ${benGuaBinary}`);
    return {
      benGua: { name: '未知', commonName: '未知卦象', id: 0 },
      zhiGua: null
    };
  }

  return { benGua, zhiGua };
};