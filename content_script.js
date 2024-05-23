let keywords = [];
let statusSwitch = null;
let isThrottled = false;
let lastExecutionTime = 0;
const throttleInterval = 500;
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
  if (!linkedinValidator()) return;
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
function linkedinValidator() {
  const isLinkedin = window.location.href.includes("linkedin");
  if (!isLinkedin) return false;
  return true;
}
function computrabajoValidator() {
  const isComputrabajo = window.location.href.includes("computrabajo");
  if (!isComputrabajo) return false;
  return true;
}
function elempleoValidator() {
  const isElempleo = window.location.href.includes("elempleo");
  if (!isElempleo) return false;
  return true;
}
function messageSender(msgId, msg) {
  try {
    chrome.runtime.sendMessage(
      {
        action: msgId,
        data: msg,
      },
      (response) => {
        console.log("Response of the message from background: ", response);
      }
    );
  } catch (error) {
    throw "Error in messageSender: " + error;
  }
}
function senderManager() {
  messageSender("getKeywords", false);
  if (linkedinValidator()) messageSender("getStatusSwitch", false);
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
    await hideViewedAndRequested(statusSwitch);
    document.addEventListener("mouseover", async () => {
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
  if (!linkedinValidator() || !computrabajoValidator() || !elempleoValidator()) return;
  console.log("Iniciando proceso");
  await initProcess();
}
main();
