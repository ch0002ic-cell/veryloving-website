(() => {
  const buttons = [...document.querySelectorAll(".faq-question")];
  const closingTimers = new WeakMap();

  function panelFor(button) {
    return document.getElementById(button.getAttribute("aria-controls"));
  }

  function close(button) {
    const panel = panelFor(button);
    if (!panel || button.getAttribute("aria-expanded") !== "true") return;

    button.setAttribute("aria-expanded", "false");
    panel.classList.remove("is-open");
    const timer = window.setTimeout(() => {
      panel.hidden = true;
      closingTimers.delete(panel);
    }, 250);
    closingTimers.set(panel, timer);
  }

  function open(button) {
    const panel = panelFor(button);
    if (!panel) return;

    const pendingClose = closingTimers.get(panel);
    if (pendingClose) window.clearTimeout(pendingClose);
    closingTimers.delete(panel);
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => panel.classList.add("is-open"));
  }

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const wasOpen = button.getAttribute("aria-expanded") === "true";
      for (const other of buttons) close(other);
      if (!wasOpen) open(button);
    });
  }
})();
