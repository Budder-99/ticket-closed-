// Default settings
const defaults = {
  pieceCount: 70,
  physicsEnabled: true
};

function restoreOptions() {
  chrome.storage.sync.get(defaults, (items) => {
    document.getElementById("pieceCount").value = items.pieceCount;
    document.getElementById("physicsEnabled").checked = items.physicsEnabled;
  });
}

function saveOptions() {
  const pieceCount = Number(document.getElementById("pieceCount").value) || defaults.pieceCount;
  const physicsEnabled = document.getElementById("physicsEnabled").checked;

  chrome.storage.sync.set(
    { pieceCount, physicsEnabled },
    () => {
      const status = document.getElementById("status");
      status.textContent = "Saved";
      setTimeout(() => (status.textContent = ""), 1500);
    }
  );
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", (e) => {
  e.preventDefault();
  saveOptions();
});