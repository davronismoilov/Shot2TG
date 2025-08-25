const $ = (id) => document.getElementById(id);
const statusEl = $("status");

function setStatus(msg, type = "info") {
    statusEl.textContent = msg || "";
    statusEl.style.color = type === "error" ? "#dc2626" : type === "ok" ? "#059669" : "#6b7280";
}

async function loadSettings() {
    const { token, chatId, intervalMinutes, autoEnabled } = await chrome.storage.local.get({
        token: "",
        chatId: "",
        intervalMinutes: 10,
        autoEnabled: false
    });

    $("token").value = token;
    $("chatId").value = chatId;
    $("interval").value = String(intervalMinutes);

    if (autoEnabled) {
        setStatus(`Avto yuborish yoqilgan (har ${intervalMinutes} daqiqada).`, "ok");
    } else {
        setStatus("Avto yuborish o‘chirilgan.");
    }
}

async function saveSettings(partial) {
    await chrome.storage.local.set(partial);
}

function validateInputs(requireAll = true) {
    const token = $("token").value.trim();
    const chatId = $("chatId").value.trim();
    const intervalMinutes = parseInt($("interval").value, 10);

    if (!token || !chatId) {
        setStatus("Token va Chat ID to‘ldirilishi shart.", "error");
        return null;
    }
    if (Number.isNaN(intervalMinutes) || intervalMinutes < 1) {
        setStatus("Interval 1 daqiqadan katta bo‘lishi kerak.", "error");
        return null;
    }
    if (!requireAll) {
        // allow partial save if needed later
    }

    return { token, chatId, intervalMinutes };
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadSettings();

    $("startAuto").addEventListener("click", async () => {
        const data = validateInputs(true);
        if (!data) return;

        await saveSettings({
            token: data.token,
            chatId: data.chatId,
            intervalMinutes: data.intervalMinutes,
            autoEnabled: true
        });

        chrome.runtime.sendMessage(
            { type: "startAuto", intervalMinutes: data.intervalMinutes },
            (resp) => {
                if (resp && resp.ok) {
                    setStatus(`Avto yuborish yoqildi (har ${data.intervalMinutes} daqiqa).`, "ok");
                } else {
                    setStatus("Avto yuborishni yoqishda xatolik.", "error");
                }
            }
        );
    });

    $("sendNow").addEventListener("click", async () => {
        const data = validateInputs(true);
        if (!data) return;

        await saveSettings({ token: data.token, chatId: data.chatId });
        setStatus("Yuborilmoqda...");

        chrome.runtime.sendMessage({ type: "sendNow" }, (resp) => {
            if (resp && resp.ok) setStatus("Yuborildi.", "ok");
            else setStatus("Yuborishda xatolik.", "error");
        });
    });

    $("stopAuto").addEventListener("click", async () => {
        await saveSettings({ autoEnabled: false });
        chrome.runtime.sendMessage({ type: "stopAuto" }, (resp) => {
            if (resp && resp.ok) setStatus("Avto yuborish o‘chirildi.", "ok");
            else setStatus("O‘chirishda xatolik.", "error");
        });
    });
});
