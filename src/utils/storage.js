// src/utils/storage.js
const STORAGE_KEY = 'divination_history_logs';

/**
 * 获取原始数据
 */
export const getHistoryLogs = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
};

/**
 * 核心功能：清理一周前的记录
 * 返回清理后的数据
 */
export const cleanupOldHistory = () => {
    try {
        const allLogs = getHistoryLogs();
        const today = new Date();
        const validDates = [];

        // 生成最近 7 天的日期 Key 列表 (包含今天)
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            validDates.push(d.toISOString().split('T')[0]);
        }

        const filteredLogs = {};
        let hasChanged = false;

        // 只保留存在于最近 7 天列表中的数据
        Object.keys(allLogs).forEach(dateKey => {
            if (validDates.includes(dateKey)) {
                filteredLogs[dateKey] = allLogs[dateKey];
            } else {
                hasChanged = true; // 发现了旧数据
            }
        });

        // 只有在数据真正发生变化时才写回 localStorage，优化性能
        if (hasChanged) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLogs));
        }

        return filteredLogs;
    } catch (e) {
        console.error("Cleanup history failed", e);
        return {};
    }
};

/**
 * 保存或更新记录
 */
export const saveHistoryToLocal = (record) => {
    try {
        // 保存前先跑一遍清理，确保空间可用
        const allLogs = cleanupOldHistory();

        const date = new Date(record.id);
        const dateKey = date.toISOString().split('T')[0];

        if (!allLogs[dateKey]) allLogs[dateKey] = [];

        const existingIndex = allLogs[dateKey].findIndex(item => item.id === record.id);

        if (existingIndex > -1) {
            allLogs[dateKey][existingIndex] = {
                ...allLogs[dateKey][existingIndex],
                ...record,
                updatedAt: Date.now()
            };
        } else {
            allLogs[dateKey].unshift({ ...record, timestamp: record.id });
            // 限制每天最多3条
            allLogs[dateKey] = allLogs[dateKey].slice(0, 3);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(allLogs));
        return allLogs;
    } catch (e) {
        console.error("Save failed", e);
        return {};
    }
};

// 删除单条记录
export const deleteHistoryRecord = (id) => {
    const data = getHistoryLogs();
    Object.keys(data).forEach(date => {
        data[date] = data[date].filter(item => item.id !== id);
        if (data[date].length === 0) delete data[date];
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 全部清空
export const clearAllHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};