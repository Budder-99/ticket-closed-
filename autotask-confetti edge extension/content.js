(() => {
  if (window.__autotaskConfettiInstalled) return;
  window.__autotaskConfettiInstalled = true;

  const buttonSelector = '.Button2.ButtonIcon2.NormalBackground';

  const settingsDefaults = {
    pieceCount: 200,
    physicsEnabled: true,
    sizeMultiplier: 1.0,
    durationMs: 2000,
    colorMode: "classic",   // "classic" | "pink" | "company"
    originMode: "corners"   // "corners" | "bottomCorners"
  };

  const settings = { ...settingsDefaults };

  function loadSettings() {
    if (!chrome?.storage?.sync) return;
    chrome.storage.sync.get(settingsDefaults, (items) => {
      settings.pieceCount = items.pieceCount;
      settings.physicsEnabled = items.physicsEnabled;
      settings.sizeMultiplier = items.sizeMultiplier;
      settings.durationMs = items.durationMs;
      settings.colorMode = items.colorMode;
      settings.originMode = items.originMode;
      console.log("Autotask Confetti settings loaded", settings);
    });
  }

  loadSettings();

  if (chrome?.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "sync") return;
      if (changes.pieceCount) {
        settings.pieceCount = changes.pieceCount.newValue;
      }
      if (changes.physicsEnabled) {
        settings.physicsEnabled = changes.physicsEnabled.newValue;
      }
      if (changes.sizeMultiplier) {
        settings.sizeMultiplier = changes.sizeMultiplier.newValue;
      }
      if (changes.durationMs) {
        settings.durationMs = changes.durationMs.newValue;
      }
      if (changes.colorMode) {
        settings.colorMode = changes.colorMode.newValue;
      }
      if (changes.originMode) {
        settings.originMode = changes.originMode.newValue;
      }
      console.log("Autotask Confetti settings updated", settings);
    });
  }

  function getColors() {
    switch (settings.colorMode) {
      case "pink":
        return [
          "#ffe6f5",
          "#ffc2e6",
          "#ff8fc6",
          "#ff6fb4",
          "#ff99d4"
        ];
      case "company":
        return [
          "rgb(76,119,223)",
          "rgb(83,61,134)",
          "rgb(236,54,115)",
          "#9baef5",
          "#b48edc"
        ];
      case "classic":
      default:
        return ["#ff3b30", "#34c759", "#007aff", "#ffcc00", "#af52de", "#ff9500"];
    }
  }

  function makePiece() {
  const el = document.createElement("div");
  const baseSize = 6 + Math.random() * 8;
  const factor = settings.sizeMultiplier || 1.0;
  const size = baseSize * factor;
  const palette = getColors();

  const color = palette[(Math.random() * palette.length) | 0];

  el.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: ${size}px;
    height: ${size * (0.6 + Math.random() * 0.8)}px;
    background: ${color};
    z-index: 2147483647;
    pointer-events: none;
    opacity: 1;
    border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
    will-change: transform, left, top;
    box-shadow: 0 0 14px ${color};
  `;
  document.body.appendChild(el);
  return el;
}

  // Origin based on originMode:
  // - "corners": top-left & top-right
  // - "bottomCorners": bottom-left & bottom-right
  function getOrigin(index, total) {
    const half = total / 2;

    if (settings.originMode === "bottomCorners") {
      const isLeft = index < half;
      const x = isLeft ? 0 : window.innerWidth;
      const y = window.innerHeight;
      return { x, y };
    }

    // default: top corners
    const isLeft = index < half;
    const x = isLeft ? 0 : window.innerWidth;
    const y = 0;
    return { x, y };
  }

  function fireConfetti() {
    if (!settings.physicsEnabled) {
      fireSimpleBurst();
    } else {
      firePhysicsBurst();
    }
  }

  function fireSimpleBurst() {
    const count = settings.pieceCount;
    const baseDuration = settings.durationMs || 2000;

    for (let i = 0; i < count; i++) {
      const { x: ox, y: oy } = getOrigin(i, count);

      const el = makePiece();
      const x = ox;
      const y = oy;
      const drift = (Math.random() - 0.5) * 320;

      const dur = baseDuration * (0.9 + Math.random() * 0.2);

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      requestAnimationFrame(() => {
        el.style.transition = `transform ${dur}ms linear, top ${dur}ms linear, left ${dur}ms ease-out`;

        if (settings.originMode === "bottomCorners") {
          // Bottom corners: move upwards
          el.style.top = `${-60}px`;
        } else {
          // Top corners: fall down
          el.style.top = `${window.innerHeight + 60}px`;
        }

        el.style.left = `${x + drift}px`;
        el.style.transform = `rotate(${(Math.random() - 0.5) * 720}deg)`;
      });

      setTimeout(() => el.remove(), dur + 250);
    }
  }

  function firePhysicsBurst() {
    const count = settings.pieceCount;

    const baseDuration = settings.durationMs || 2000;
    const durationFactor = baseDuration / 2000;

    const gravityBase = 1800;
    const gravity = gravityBase / durationFactor;

    const pieces = [];

    for (let i = 0; i < count; i++) {
      const { x: ox, y: oy } = getOrigin(i, count);

      const el = makePiece();

      const speedScale = 1 / durationFactor;

      let vx = (Math.random() - 0.5) * 900 * speedScale;
      let vy;

      if (settings.originMode === "bottomCorners") {
        // From bottom corners, shoot upward
        vy = (-600 - Math.random() * 400) * speedScale;
      } else {
        // From top corners, drop/spread down
        vy = (50 - Math.random() * 700) * speedScale;
      }

      pieces.push({
        el,
        x: ox,
        y: oy,
        vx,
        vy,
        vr: (Math.random() - 0.5) * 12,
        rot: Math.random() * 360,
        age: 0,
        ttl: baseDuration * (0.9 + Math.random() * 0.2)
      });
    }

    let last = performance.now();

    function frame(now) {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;

      for (const p of pieces) {
        if (!p.el) continue;

        p.age += dt * 1000;
        p.vy += gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * 60 * dt;

        p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;

        const offBottom = p.y > window.innerHeight + 100;
        const offTop = p.y < -100;

        if (p.age > p.ttl || offBottom || offTop) {
          p.el.remove();
          p.el = null;
        }
      }

      if (pieces.some(p => p.el)) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function isSaveAndCloseButton(el) {
    if (!el || !el.matches?.(buttonSelector)) return false;
    const text =
      el.querySelector(".Text2")?.textContent?.trim() ||
      el.textContent?.trim() ||
      "";
    return /Save\s*&\s*Close/i.test(text);
  }

  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target.closest(buttonSelector);
      if (!btn) return;
      if (!isSaveAndCloseButton(btn)) return;
      fireConfetti();
    },
    true
  );

  chrome.runtime?.onMessage?.addListener((msg) => {
    if (msg && msg.type === "autotask-confetti-test") {
      fireConfetti();
    }
  });

  console.log("Autotask Confetti content script loaded with settings", settings);
})();