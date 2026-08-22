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

  const videoShell = document.querySelector("[data-video-shell]");
  const videoButton = videoShell?.querySelector("[data-video-src]");
  const videoStatus = videoShell?.querySelector("[data-video-status]");

  if (videoShell && videoButton && videoStatus) {
    videoButton.addEventListener("click", () => {
      if (videoShell.classList.contains("is-loaded")) return;

      let videoUrl;
      try {
        videoUrl = new URL(videoButton.dataset.videoSrc);
      } catch {
        videoStatus.textContent = "The video address is invalid and was not loaded.";
        return;
      }

      if (
        videoUrl.protocol !== "https:" ||
        videoUrl.hostname !== "www.youtube-nocookie.com" ||
        !videoUrl.pathname.startsWith("/embed/") ||
        videoUrl.username ||
        videoUrl.password
      ) {
        videoStatus.textContent = "The video address is not approved and was not loaded.";
        return;
      }

      const frame = document.createElement("iframe");
      frame.src = videoUrl.href;
      frame.title = videoButton.dataset.videoTitle || "VeryLoving product-vision video";
      frame.loading = "eager";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.allow = "encrypted-media; picture-in-picture; fullscreen";
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-presentation");
      frame.setAttribute("allowfullscreen", "");
      frame.tabIndex = 0;

      videoButton.disabled = true;
      videoStatus.textContent = "Loading the video from YouTube.";
      videoShell.classList.add("is-loaded");
      videoShell.append(frame);
      frame.addEventListener(
        "load",
        () => {
          videoStatus.textContent = "The YouTube video is loaded.";
          frame.focus();
        },
        { once: true },
      );
    });
  }
})();
