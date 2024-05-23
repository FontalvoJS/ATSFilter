function sendMessageToActiveTab(action, data) {
  chrome.tabs.query({ active: true }, (tabs) => {
    if (tabs.length > 0) {
      if (
        tabs[0].url.includes("linkedin") ||
        tabs[0].url.includes("elempleo") ||
        (tabs[0].url.includes("computrabajo") && tabs[0].active)
      ) {
        chrome.tabs.sendMessage(tabs[0].id, { action, ...data });
      }
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "keywordsValidated") {
    chrome.storage.sync.set({
      keywords: message.data.length > 0 ? message.data : ["baires"],
    });
  } else if (message.action === "statusSwitch") {
    chrome.storage.sync.set({ statusSwitch: message.data });
  } else if (
    message.action === "getStatusSwitch" ||
    message.action === "getKeywords"
  ) {
    const key =
      message.action === "getStatusSwitch" ? "statusSwitch" : "keywords";
    chrome.storage.sync.get([key], (items) => {
      sendMessageToActiveTab(
        message.action === "getStatusSwitch"
          ? "receiveStatusSwitch"
          : "receiveKeywords",
        { [key]: items[key] || (key === "statusSwitch" ? false : ["baires"]) }
      );
    });
    sendResponse({ status: "success" });
  } else if (message.action === "updateApp") {
    sendMessageToActiveTab("updateApp", {
      urlApp: "https://github.com/FontalvoJS/ATSFilter",
    });
    sendResponse({ status: "success" });
  }
});
