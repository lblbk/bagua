// src/utils/guaLogic.js

export const GUA_CONFIG = {
  6: { 
    name: '老阴', 
    // 阴爻 + 变爻标记 x
    symbol: '▅▅　▅▅', 
    mark: '✕',
    color: 'text-blue-600',
    type: 'yin'
  },
  7: { 
    name: '少阳', 
    // 阳爻
    symbol: '▅▅▅▅▅', 
    mark: '',
    color: 'text-gray-800',
    type: 'yang'
  },
  8: { 
    name: '少阴', 
    // 阴爻
    symbol: '▅▅　▅▅', 
    mark: '',
    color: 'text-gray-800',
    type: 'yin'
  },
  9: { 
    name: '老阳', 
    // 阳爻 + 变爻标记 o
    symbol: '▅▅▅▅▅', 
    mark: '○',
    color: 'text-red-600',
    type: 'yang'
  }
};

export const calculateGua = (results, yangSetting) => {
  const valHeads = yangSetting === 'heads' ? 3 : 2;
  const valTails = yangSetting === 'tails' ? 3 : 2;

  let sum = 0;
  results.forEach(r => {
    if (r === '字') sum += valHeads;
    else sum += valTails;
  });

  return GUA_CONFIG[sum] || { 
    name: '未知', 
    symbol: '?', 
    mark: '',
    color: 'text-gray-400' 
  };
};