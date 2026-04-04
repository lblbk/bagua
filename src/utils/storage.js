// src/utils/storage.js
const STORAGE_KEY = 'divination_history_logs';

/**
 * 获取所有历史记录
 * @returns {Object} 键为日期(YYYY-MM-DD)，值为数组
 */
export const getHistoryLogs = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("读取本地存储失败:", e);
        return {};
    }
};

/**
 * 保存一条记录到本地
 * @param {Object} record 包含 question, history, finalGuaInfo, aiResponse
 */
export const saveHistoryToLocal = (record) => {
    try {
        const allLogs = getHistoryLogs();
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0];

        // 1. 插入新数据（每天最多3条）
        if (!allLogs[dateKey]) allLogs[dateKey] = [];
        allLogs[dateKey].unshift({ ...record, timestamp: Date.now() });
        allLogs[dateKey] = allLogs[dateKey].slice(0, 3);

        // 2. 清理逻辑：只保留最近 7 天的 Key
        const validDates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            validDates.push(d.toISOString().split('T')[0]);
        }

        const filteredLogs = {};
        validDates.forEach(date => {
            if (allLogs[date]) filteredLogs[date] = allLogs[date];
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLogs));
        return filteredLogs;
    } catch (e) { return {}; }
};

/**
 * 清除所有记录（可选功能）
 */
export const clearAllHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};