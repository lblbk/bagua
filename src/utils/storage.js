// src/utils/storage.js
const STORAGE_KEY = 'divination_history_logs';

/**
 * 【新增】统一的时间格式化工具：确保只取本地时间的 YYYY-MM-DD
 * 避免 toISOString() 带来的时区偏差问题
 */
const getLocalDateKey = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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
 * 真正清理并释放 localStorage 空间
 */
export const cleanupOldHistory = () => {
    try {
        const allLogs = getHistoryLogs();
        const validDates = [];

        // 生成最近 7 天的本地日期 Key 列表 (包含今天)
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            validDates.push(getLocalDateKey(d)); // 使用统一的本地时间生成
        }

        const filteredLogs = {};
        let hasChanged = false;

        // 遍历历史记录
        Object.keys(allLogs).forEach(dateKey => {
            if (validDates.includes(dateKey)) {
                // 如果是最近 7 天的记录，保留
                filteredLogs[dateKey] = allLogs[dateKey];
            } else {
                // 如果不是，丢弃（这就起到了真正的删除/释放空间作用）
                hasChanged = true;
            }
        });

        // 仅在删除了过期数据时，才覆写 localStorage 释放空间
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
        const allLogs = getHistoryLogs();
        const targetId = Number(record.id); // 统一转为数字
        let updated = false;

        // 1. 【全局搜索并更新】
        for (const dateKey of Object.keys(allLogs)) {
            const index = allLogs[dateKey].findIndex(item => Number(item.id) === targetId);
            if (index > -1) {
                allLogs[dateKey][index] = {
                    ...allLogs[dateKey][index],
                    ...record,
                    updatedAt: Date.now()
                };
                updated = true;
                break;
            }
        }

        // 2. 如果全局都没找到，作为【新记录】插入
        if (!updated) {
            // 使用统一的函数生成时间的 Key
            const dateKey = getLocalDateKey(new Date(targetId));

            if (!allLogs[dateKey]) allLogs[dateKey] = [];
            allLogs[dateKey].unshift({ ...record, timestamp: record.id });

            // 每天限制最多保留 3 条
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
        if (data[date].length === 0) delete data[date]; // 如果数组空了，连键名也删掉
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 全部清空
export const clearAllHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};