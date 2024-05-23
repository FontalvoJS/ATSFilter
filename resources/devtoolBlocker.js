// Bloquear el atajo de teclado F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U y Ctrl+Shift+C
document.addEventListener("keydown", function (event) {
  if (
    (event.ctrlKey &&
      event.shiftKey &&
      ["I", "J", "C"].includes(event.key.toUpperCase())) ||
    (event.ctrlKey && event.key.toUpperCase() === "U") ||
    event.key.toUpperCase() === "F12"
  ) {
    event.preventDefault();
    return false;
  }
});

// Bloquear clic derecho
document.addEventListener("contextmenu", function (event) {
  event.preventDefault();
  return false;
});

// Bloquear Ctrl+Shift+C a nivel de eventos de mouse
document.addEventListener("mousedown", function (event) {
  if (event.button === 1 && event.ctrlKey && event.shiftKey) {
    event.preventDefault();
    return false;
  }
});

// Intento de deshabilitar apertura de DevTools
(function () {
  const DevToolsChecker = function () {};
  DevToolsChecker.prototype = {
    isOpen: function () {
      const widthThreshold = window.outerWidth - window.innerWidth > 100;
      const heightThreshold = window.outerHeight - window.innerHeight > 100;
      return widthThreshold || heightThreshold;
    },
    log: function () {
      console.clear();
      console.log(
        "%cStop!",
        "color: red; font-size: 50px; font-weight: bold; -webkit-text-stroke: 1px black;"
      );
      console.log(
        "%cThis is a browser feature intended for developers.",
        "font-size: 20px;"
      );
    },
  };

  const devTools = new DevToolsChecker();
  setInterval(function () {
    if (devTools.isOpen()) {
      devTools.log();
      alert("DevTools está abierto. Por favor, ciérrelo para continuar.");
    }
  }, 1000);
})();

// Intento de deshabilitar apertura de DevTools mediante técnicas de detección
(function () {
  const element = new Image();
  Object.defineProperty(element, "id", {
    get: function () {
      alert("DevTools está abierto. Por favor, ciérrelo para continuar.");
      return "devtools";
    },
  });
  console.log(element);
})();

// Intento de bloqueo mediante detección de eval
(function () {
  const originalEval = window.eval;
  window.eval = function () {
    alert("DevTools está abierto. Por favor, ciérrelo para continuar.");
    return originalEval.apply(this, arguments);
  };
})();
