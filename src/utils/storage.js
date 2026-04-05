// src/utils/storage.js
const STORAGE_KEY = 'divination_history_logs';

export const getHistoryLogs = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
};

/**
 * 保存或更新记录
 * @param {Object} record 必须包含 id (timestamp)
 */
export const saveHistoryToLocal = (record) => {
    try {
        const allLogs = getHistoryLogs();
        // 使用记录自身的创建日期作为 key，确保回溯更新时能找到正确位置
        const date = new Date(record.id);
        const dateKey = date.toISOString().split('T')[0];

        if (!allLogs[dateKey]) allLogs[dateKey] = [];

        // 查找是否存在同 ID 记录
        const existingIndex = allLogs[dateKey].findIndex(item => item.id === record.id);

        if (existingIndex > -1) {
            // 更新逻辑：合并新旧数据
            allLogs[dateKey][existingIndex] = {
                ...allLogs[dateKey][existingIndex],
                ...record,
                updatedAt: Date.now()
            };
        } else {
            // 新增逻辑
            allLogs[dateKey].unshift({ ...record, timestamp: record.id });
            // 限制每天最多3条（仅在新增时触发限制）
            allLogs[dateKey] = allLogs[dateKey].slice(0, 3);
        }

        // 清理逻辑：只保留最近 7 天
        const today = new Date();
        const validDates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            validDates.push(d.toISOString().split('T')[0]);
        }

        const filteredLogs = {};
        validDates.forEach(dKey => {
            if (allLogs[dKey]) filteredLogs[dKey] = allLogs[dKey];
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLogs));
        return filteredLogs;
    } catch (e) {
        console.error("Save failed", e);
        return {};
    }
};

// 删除单条记录
export const deleteHistoryRecord = (id) => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    // 遍历所有日期的数组，过滤掉匹配 ID 的那一项
    Object.keys(data).forEach(date => {
        data[date] = data[date].filter(item => item.id !== id);
        if (data[date].length === 0) delete data[date]; // 如果该日记录删完了，删除日期键
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 全部清空
export const clearAllHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};