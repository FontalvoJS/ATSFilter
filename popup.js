const textarea = document.getElementById("keywords");
const switche = document.getElementById("checkbox1");
const updateApp = document.getElementById("updateApp");
let keywords = [];
async function getDataApi() {
  try {
    const url =
      "https://redlatinastl.com/controlador/classifieds/ATSFilter.php";
    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    response = await response.json();
    await manageDataFromApi(response);
  } catch (error) {
    console.log("Error al cargar los datos del API", error);
  }
}
function messageSender(msgId, msg) {
  chrome.runtime.sendMessage({
    action: msgId,
    data: msg,
  });
}
function messageListener(msgId) {
  chrome.runtime.OnMessage.addListener((message, sender, sendResponse) => {});
}
async function manageDataFromApi(data) {
  const titleApp = document.getElementById("title");
  const updateApp = document.getElementById("updateApp");
  const paragraph = document.getElementById("paragraph");
  titleApp.textContent = `${data.name}`;
  paragraph.textContent = `${data.paragraph}`;

  if (data.updateAlert) {
    updateApp.removeAttribute("hidden");
    updateApp.addEventListener("click", () => {
      messageSender("updateApp", true);
    });
  } else {
    updateApp.setAttribute("hidden", true);
  }
}
function validateKeywords(keys) {
  if (keys?.length === 0) return false;
  keywords = keys.split(",").filter((key) => key.toLowerCase().trim() !== "");
  messageSender("keywordsValidated", keywords);
  messageSender("getKeywords", false);
}
function manageTextarea() {
  textarea.addEventListener("input", () => {
    validateKeywords(textarea.value);
  });
}
function manageSwitch() {
  switche.addEventListener("change", () => {
    messageSender("statusSwitch", switche.checked);
    messageSender("getStatusSwitch", false);
  });
}
async function loadPreviewSaved() {
  getKeywords();
  getStatusSwitch();
}
function getKeywords() {
  // get the keywords from the storage
  chrome.storage.sync.get(["keywords"], function (items) {
    // check if there are keywords in the storage
    if (items?.keywords?.length > 0) {
      // clear the textarea
      textarea.value = "";
      // add each keyword to the textarea
      items.keywords.forEach((keyword) => {
        if (keyword.length > 0) {
          textarea.value += `${keyword},`;
        }
      });
    }
  });
}
function getStatusSwitch() {
  // get the status of the switch from the storage
  chrome.storage.sync.get(["statusSwitch"], function (items) {
    // set the status of the switch
    switche.checked = items.statusSwitch;
  });
}
async function initProcess() {
  await getDataApi();
  loadPreviewSaved();
  manageTextarea();
  manageSwitch();
}
initProcess();
