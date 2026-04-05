// src/utils/api.js

/**
 * ！！！重要！！！
 * 这是你未来 Cloudflare Worker 或其他后端服务的地址。
 * 现在可以先用一个占位符，但最终需要替换成你自己的真实 URL。
 */
const SHARE_WORKER_URL = 'https://webagua.lblbk.top/share';

/**
 * 将卜卦结果发送到服务器，创建一个分享记录，并获取其唯一 ID。
 * 
 * @param {object} shareData - 包含此次卜卦所有必要数据的对象。
 *   例如: { question, history, finalGuaInfo, aiResponse }
 * 
 * @returns {Promise<string|null>} 
 *   - 成功时，返回一个字符串，即唯一的 hashId (例如 'aBcDeF123')。
 *   - 失败时，返回 null。
 */
export const createShareRecord = async (shareData) => {
    try {
        // 1. 发起 POST 请求到你的服务器
        const response = await fetch(SHARE_WORKER_URL, {
            method: "POST", // 使用 POST 方法来发送数据
            headers: {
                "Content-Type": "application/json", // 告诉服务器我们发送的是 JSON 格式的数据
            },
            // 2. 将 JavaScript 对象转换为 JSON 字符串作为请求体发送
            body: JSON.stringify(shareData),
        });

        // 3. 检查 HTTP 响应状态码。如果不是 2xx (例如 404, 500)，则表示请求出错了。
        if (!response.ok) {
            const errorText = await response.text(); // 尝试读取错误信息
            // 抛出一个错误，这个错误会被下面的 catch 块捕获
            throw new Error(`创建分享链接失败，服务器响应: ${response.status} ${errorText}`);
        }

        // 4. 如果请求成功，将返回的 JSON 数据解析为 JavaScript 对象
        const result = await response.json();

        // 5. 根据你和后端约定好的数据格式，检查返回的数据是否有效。
        //    我们假设后端会返回 { success: true, hashId: '...' }
        if (result.success && result.hashId) {
            return result.hashId; // 成功，返回这个唯一的 ID
        } else {
            // 如果后端返回的数据格式不对，也算作失败。
            throw new Error("服务器返回的数据格式不正确。");
        }

    } catch (err) {
        // 6. 捕获上面任何一步可能发生的错误（网络问题、服务器崩溃、数据格式错误等）
        console.error("createShareRecord 函数出错:", err);
        return null; // 向调用者返回 null，表示操作失败
    }
};

export const getShareRecord = async (hashId) => {
    try {
        const response = await fetch(`${SHARE_WORKER_URL}/${hashId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            if (response.status === 404) console.warn("分享记录不存在或已过期");
            return null;
        }

        return await response.json();
    } catch (err) {
        console.error("getShareRecord 失败:", err);
        return null;
    }
};