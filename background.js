async function captureAndSend() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["token", "chatId"], async (data) => {
            const token = data.token;
            const chatId = data.chatId;

            if (!token || !chatId) {
                console.error("Token yoki chatId yo'q");
                return resolve(false);
            }

            chrome.tabs.captureVisibleTab(null, {format: "png"}, async (imgUrl) => {
                try {
                    const blob = await (await fetch(imgUrl)).blob();
                    const formData = new FormData();
                    formData.append("chat_id", chatId);
                    formData.append("photo", blob, "screenshot.png");

                    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
                        method: "POST",
                        body: formData
                    });

                    resolve(res.ok);
                } catch (err) {
                    console.error("Xato:", err);
                    resolve(false);
                }
            });
        });
    });
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(["interval"], (data) => {
        const interval = data.interval || 60;
        chrome.alarms.create("sendScreenshot", {periodInMinutes: interval});
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "sendScreenshot") {
        captureAndSend();
    }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "updateAlarm") {
        chrome.alarms.clear("sendScreenshot", () => {
            chrome.alarms.create("sendScreenshot", {periodInMinutes: msg.interval});
        });
    }
    if (msg.type === "sendNow") {
        captureAndSend().then((ok) => sendResponse({ok}));
        return true;
    }
});
