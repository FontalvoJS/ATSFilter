chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // OK
  if (message.action === "keywordsValidated") {
    chrome.storage.sync.set({
      keywords: message.data.length > 0 ? message.data : ["baires"],
    });
  } else if (message.action === "statusSwitch") {
    chrome.storage.sync.set({ statusSwitch: message.data });
  } else if (message.action === "getStatusSwitch") {
    chrome.storage.sync.get(["statusSwitch"], function (items) {
      chrome.tabs.query({ active: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "receiveStatusSwitch",
            statusSwitch: items.statusSwitch || false,
          });
        } else {
          console.log("No active tab found");
        }
      });
    });
    sendResponse({ status: "success" });
  } else if (message.action === "getKeywords") {
    chrome.storage.sync.get(["keywords"], function (items) {
      chrome.tabs.query({ active: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "receiveKeywords",
            keywords: items.keywords || ["baires"],
          });
        } else {
          console.log("No active tab found");
        }
      });
    });
    sendResponse({ status: "success" });
  } else if (message.action === "updateApp") {
    chrome.tabs.query({ active: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateApp",
          urlApp: "https://github.com/FontalvoJS/ATSFilter",
        });
      } else {
        console.log("No active tab found");
      }
    });
    sendResponse({ status: "success" });
  }
});
