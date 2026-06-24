const defaults = {
  pieceCount: 200,
  physicsEnabled: true,
  sizeMultiplier: 1.0,
  durationMs: 2000,
  colorMode: "classic",
  originMode: "corners"
};

function restoreSettings() {
  chrome.storage.sync.get(defaults, (items) => {
    document.getElementById("pieceCount").value = items.pieceCount;
    document.getElementById("physicsEnabled").checked = items.physicsEnabled;
    document.getElementById("sizeMultiplier").value = items.sizeMultiplier;
    document.getElementById("durationMs").value = items.durationMs;
    document.getElementById("colorMode").value = items.colorMode;
    document.getElementById("originMode").value = items.originMode;
  });
}

function saveSettings() {
  const pieceCount =
    Number(document.getElementById("pieceCount").value) || defaults.pieceCount;
  const physicsEnabled = document.getElementById("physicsEnabled").checked;

  const sizeMultiplierRaw =
    Number(document.getElementById("sizeMultiplier").value) || defaults.sizeMultiplier;
  const sizeMultiplier = Math.min(3, Math.max(0.5, sizeMultiplierRaw));

  const durationRaw =
    Number(document.getElementById("durationMs").value) || defaults.durationMs;
  const durationMs = Math.min(6000, Math.max(500, durationRaw));

  const colorMode = document.getElementById("colorMode").value || defaults.colorMode;
  const originMode = document.getElementById("originMode").value || defaults.originMode;

  chrome.storage.sync.set(
    { pieceCount, physicsEnabled, sizeMultiplier, durationMs, colorMode, originMode },
    () => {
      const status = document.getElementById("status");
      status.textContent = "Saved!";
      setTimeout(() => (status.textContent = ""), 1200);
    }
  );
}

function testConfetti() {
  const status = document.getElementById("status");
  status.textContent = "";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) {
      status.textContent = "No active tab.";
      setTimeout(() => (status.textContent = ""), 1500);
      return;
    }

    chrome.tabs.sendMessage(
      tab.id,
      { type: "autotask-confetti-test" },
      () => {
        if (!chrome.runtime.lastError) {
          status.textContent = "Test sent.";
          setTimeout(() => (status.textContent = ""), 800);
        }
      }
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  restoreSettings();

  document.getElementById("save").addEventListener("click", (e) => {
    e.preventDefault();
    saveSettings();
  });

  document.getElementById("test").addEventListener("click", (e) => {
    e.preventDefault();
    testConfetti();
  });
});