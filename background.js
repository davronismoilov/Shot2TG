const ALARM_NAME = "shot2tg_auto";

// Extension ishga tushganda mavjud sozlamaga ko'ra alarmni tiklash
chrome.runtime.onStartup.addListener(ensureAlarmFromStorage);
chrome.runtime.onInstalled.addListener(ensureAlarmFromStorage);

// Popup’dan keladigan xabarlar
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "startAuto") {
        const minutes = parseInt(msg.intervalMinutes, 10) || 10;
        chrome.storage.local.set({autoEnabled: true, intervalMinutes: minutes}, () => {
            restartAlarm(minutes).then(() => sendResponse({ok: true})).catch(() => sendResponse({ok: false}));
        });
        return true; // async response
    }

    if (msg.type === "stopAuto") {
        chrome.storage.local.set({autoEnabled: false}, () => {
            chrome.alarms.clear(ALARM_NAME, () => sendResponse({ok: true}));
        });
        return true;
    }

    if (msg.type === "sendNow") {
        captureAndSend().then((ok) => sendResponse({ok})).catch(() => sendResponse({ok: false}));
        return true;
    }
});

// Alarm trigger bo‘lganda
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        captureAndSend();
    }
});

// Alarmni qayta yaratish
async function restartAlarm(minutes) {
    await chrome.alarms.clear(ALARM_NAME);
    await chrome.alarms.create(ALARM_NAME, {periodInMinutes: minutes});
}

// Saqlangan holatdan alarmni tiklash
function ensureAlarmFromStorage() {
    chrome.storage.local.get({autoEnabled: false, intervalMinutes: 10}, (cfg) => {
        if (cfg.autoEnabled) {
            restartAlarm(parseInt(cfg.intervalMinutes, 10) || 10);
        } else {
            chrome.alarms.clear(ALARM_NAME);
        }
    });
}

// Screenshot olib yuborish
async function captureAndSend() {
    try {
        const {token, chatId} = await chrome.storage.local.get(["token", "chatId"]);
        if (!token || !chatId) {
            console.warn("Token yoki chatId kiritilmagan");
            return false;
        }

        const tabs = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        if (!tabs || !tabs.length) {
            console.warn("Aktiv tab topilmadi");
            return false;
        }

        const dataUrl = await new Promise((resolve, reject) => {
            chrome.tabs.captureVisibleTab(null, {format: "png"}, (url) => {
                if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                if (!url) return reject(new Error("Screenshot URL bo'sh"));
                resolve(url);
            });
        });

        const blob = await (await fetch(dataUrl)).blob();
        const formData = new FormData();
        formData.append("chat_id", String(chatId));
        formData.append("photo", blob, "screenshot.png");

        const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error("Telegram javobi xato:", res.status, text);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Yuborishda xatolik:", e);
        return false;
    }
}
