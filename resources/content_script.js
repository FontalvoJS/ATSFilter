let keywords = [];
let statusSwitch = null;
let isThrottled = false;
let lastExecutionTime = 0;
const throttleInterval = 1000;
const url = window.location.href;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "receiveKeywords") {
    keywords = message.keywords;
  } else if (message.action === "receiveStatusSwitch") {
    statusSwitch = message.statusSwitch;
    hideViewedAndRequested(statusSwitch);
  } else if (message.action === "updateApp") {
    window.location.href = message.urlApp;
  }
});

// PRINCIPAL FUNCTIONS
async function hideSpammers() {
  const currentlyUrl = window.location.href;
  let allElements = [];
  const elementsToSearch = [
    { brand: "elempleo", className: "info-company-name", parentNodes: 5 },
    { brand: "computrabajo", className: "fc_base t_ellipsis", parentNodes: 1 },
    {
      brand: "linkedin",
      className: "job-card-container__primary-description",
      parentNodes: 5,
    },
  ];

  for (const { brand, className, parentNodes } of elementsToSearch) {
    if (!currentlyUrl.includes(brand)) continue;

    const elementSelector = document.getElementsByClassName(className);
    for (let i = 0; i < elementSelector.length; i++) {
      const enterpriseName = elementSelector[i].textContent.trim();
      if (
        keywords.some((keyword) =>
          new RegExp(keyword.trim(), "i").test(enterpriseName.trim())
        )
      ) {
        let initialPotition = elementSelector[i].parentNode;
        for (let j = 0; j < parentNodes; j++) {
          initialPotition = initialPotition.parentNode;
        }
        allElements.push(initialPotition);
      }
    }
    if (allElements.length > 0) {
      for (let i = 0; i < allElements.length; i++) {
        allElements[i].style.display = "none";
      }
    }
  }
}
async function triesLogic(elements, tries) {
  while (elements.length === 0 && tries < 10) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    elements = document.getElementsByClassName(
      "job-card-container__footer-job-state"
    );
    tries++;
  }
}
async function hideViewedAndRequested(reset) {
  let tries = 0;
  let allElements = [];
  if (!url.includes("linkedin")) return;
  let elements = document.getElementsByClassName(
    "job-card-container__footer-job-state"
  );
  await triesLogic(elements, tries);
  const hideElements = (elements) => {
    Array.from(elements).forEach((element) => {
      const eleText = element.textContent.trim();
      if (eleText === "Solicitados" || eleText === "Visto") {
        let currentParentNode = element.parentNode;
        for (let i = 0; i < 4; i++) {
          currentParentNode = currentParentNode.parentNode;
        }
        allElements.push(currentParentNode);
      }
    });
    if (allElements.length > 0) {
      for (let i = 0; i < allElements.length; i++) {
        allElements[i].style.display = reset ? "none" : "block";
      }
    }
  };
  if (elements) {
    hideElements(elements);
  }
}
// SUB FUNCTIONS
function brandValidator() {
  return (url) => {
    return (
      url.includes("elempleo") ||
      url.includes("computrabajo") ||
      url.includes("linkedin")
    );
  };
}
function messageSender(msgId, msg) {
  try {
    chrome.runtime.sendMessage({
      action: msgId,
      data: msg,
    });
  } catch (error) {
    throw "Error in messageSender: " + error;
  }
}
function senderManager() {
  if (isValidContext()) {
    try {
      messageSender("getKeywords", false);
      if (brandValidator()(url)) messageSender("getStatusSwitch", false);
    } catch (err) {
      console.log(err);
    }
  }
}
function isValidContext() {
  return !document.hidden && chrome.runtime && chrome.runtime.id;
}
async function manageExecution() {
  if (!isThrottled) {
    try {
      isThrottled = true;
      requestAnimationFrame(async () => {
        const currentTime = Date.now();

        if (currentTime - lastExecutionTime >= throttleInterval) {
          hideSpammers();
          senderManager();
          await hideViewedAndRequested(statusSwitch);
          lastExecutionTime = currentTime;
        }

        isThrottled = false;
      });
    } catch (err) {
      throw err;
    }
  }
}
// MAIN
async function initProcess() {
  try {
    senderManager();
    await manageExecution();
    await hideViewedAndRequested(statusSwitch);
    document.addEventListener("mousemove", async () => {
      await manageExecution();
    });
    document.addEventListener("scroll", async () => {
      await manageExecution();
    });
    document.addEventListener("click", async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      await manageExecution();
    });
  } catch (err) {
    alert(
      "ATS Filter (ERROR: [" +
        err +
        "]) envia este problema a mejia_andres@hotmail.es para que sea solucionado."
    );
  }
}
async function main() {
  if (brandValidator()(url)) await initProcess();
}
main();
