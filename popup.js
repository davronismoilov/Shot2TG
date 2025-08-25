document.addEventListener("DOMContentLoaded", () => {
    const tokenInput = document.getElementById("token");
    const chatIdInput = document.getElementById("chatId");
    const intervalInput = document.getElementById("interval");
    const statusDiv = document.getElementById("status");

    chrome.storage.local.get(["token", "chatId", "interval"], (data) => {
        if (data.token) tokenInput.value = data.token;
        if (data.chatId) chatIdInput.value = data.chatId;
        if (data.interval) intervalInput.value = data.interval;
    });

    document.getElementById("save").addEventListener("click", () => {
        const token = tokenInput.value.trim();
        const chatId = chatIdInput.value.trim();
        const interval = parseInt(intervalInput.value.trim()) || 60;

        chrome.storage.local.set({ token, chatId, interval }, () => {
            chrome.runtime.sendMessage({ type: "updateAlarm", interval });
            statusDiv.textContent = "Sozlamalar saqlandi.";
        });
    });

    document.getElementById("sendNow").addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "sendNow" }, (response) => {
            if (response && response.ok) {
                statusDiv.textContent = "Skrin yuborildi.";
            } else {
                statusDiv.textContent = "Yuborishda xatolik.";
            }
        });
    });
});
