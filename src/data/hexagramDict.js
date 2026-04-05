// src/data/hexagramDict.js
import hexagramsMd from './hexagrams.md?raw';
import { parseHexagramMarkdown } from '../utils/ParserMarkdown';

// 只在文件加载时解析一次，缓存在内存中
export const ALL_HEXAGRAM_DETAILS = parseHexagramMarkdown(hexagramsMd);

// 提供一个便捷的查找方法
export const getHexagramDetailByName = (name) => {
    if (!name) return null;
    return ALL_HEXAGRAM_DETAILS.find(d => d.title.includes(name)) || null;
};