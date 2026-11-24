(() => {
  // Character presets synced to Rock Chopper's 3 miners
  const MINER_PROFILES = {
    neil: {
      id: "neil",
      label: "NEIL • ALL-ROUNDER",
      maxHp: 110,
      maxJumps: 2,
      airSpeed: 5.6,
      scoreMult: 1.3, // +30% score perk
      bossDmg: 7,
      primary: "#f59e0b",
      trim: "#10b981",
      skin: "#d99b66",
      hair: "#451a03",
      visor: "#fef08a"
    },
    xavier: {
      id: "xavier",
      label: "XAVIER • HEAVY CRUSHER",
      maxHp: 145, // Heavy armor HP
      maxJumps: 2,
      airSpeed: 5.0,
      scoreMult: 1.0,
      bossDmg: 10, // Crushes bosses faster
      primary: "#3b82f6",
      trim: "#ef4444",
      skin: "#8d5524",
      hair: "#1e293b",
      visor: "#38bdf8"
    },
    carter: {
      id: "carter",
      label: "CARTER • TRAILBLAZER SCOUT",
      maxHp: 95,
      maxJumps: 2,
      airSpeed: 7.4, // +35% air shift speed perk
      scoreMult: 1.1,
      bossDmg: 6,
      primary: "#22c55e",
      trim: "#a3e635",
      skin: "#f1c27d",
      hair: "#713f12",
      visor: "#ffffff"
    }
  };

  function detectActiveMiner() {
    const badge = document.getElementById("activeMinerBadge");
    if (badge) {
      const txt = badge.textContent.toLowerCase();
      if (txt.includes("xavier")) return MINER_PROFILES.xavier;
      if (txt.includes("carter")) return MINER_PROFILES.carter;
      if (txt.includes("neil")) return MINER_PROFILES.neil;
    }
    const selectedCard = document.querySelector("#titleScreen .char-card.selected");
    if (selectedCard) {
      const key = selectedCard.getAttribute("data-char");
      if (MINER_PROFILES[key]) return MINER_PROFILES[key];
    }
    return MINER_PROFILES.neil;
  }

  function triggerRockChopperRewards() {
    if (window.__scParkourRewardClaimed) return;
    window.__scParkourRewardClaimed = true;

    // 1. Call script.js's internal reward hook if wired
    if (typeof window.grantRockChopperParkourRewards === "function") {
      try {
        window.grantRockChopperParkourRewards();
      } catch (err) {
        console.error("Parkour reward hook error:", err);
      }
    }

    // 2. Reveal the Parkour Master badge on the Leaderboard tab UI
    const badgeShowcase = document.getElementById("accountBadgeShowcase");
    if (badgeShowcase) badgeShowcase.style.display = "block";

    // 3. Log achievement in the Quarry Log
    const log = document.getElementById("combatLog");
    if (log) {
      const entry = document.createElement("div");
      entry.style.color = "#4ade80";
      entry.style.fontWeight = "800";
      entry.style.marginTop = "4px";
      entry.textContent = "🏆 PARKOUR CLEARED! Unlocked Parkour Chikorita & Parkour Master Badge!";
      log.prepend(entry);
    }

    // 4. Trigger local save & cloud leaderboard sync buttons if active
    const saveBtn = document.getElementById("manualSaveBtn");
    if (saveBtn) saveBtn.click();
    const syncBtn = document.getElementById("syncScoreBtn");
    const loggedInWrap = document.getElementById("loggedInWrap");
    if (syncBtn && loggedInWrap && loggedInWrap.style.display !== "none") {
      syncBtn.click();
    }
  }

  function launchSmashCenterParkour() {
    if (window.__scParkourCleanup) window.__scParkourCleanup();
    window.__scParkourRewardClaimed = false;

    const RUNNER = detectActiveMiner();

    // --- Procedural Web Audio Chiptune Synthesizer ---
    let audioCtx = null;
    let muted = false;
    const sfx = (freq, dur = 0.06, type = "square", vol = 0.06) => {
      if (muted) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
      } catch (_) {}
    };

    // --- 3 Multi-Stage Progression Biomes ---
    const STAGES = [
      {
        num: 1,
        name: "CRYSTAL QUARRY",
        bg: "#090306",
        grid: "#1c0912",
        platFill: "#1e0b14",
        platTop: "#ef4444",
        platStroke: "#7f1d1d",
        accent: "#ef4444",
        baseSpeed: 7.5,
        parkourGoal: 100,
        bossHp: 180,
        bossReward: 150,
        boltSpeed: 8.0,
        boltCd: 44
      },
      {
        num: 2,
        name: "MAGMA CORE",
        bg: "#0c0502",
        grid: "#241106",
        platFill: "#261207",
        platTop: "#f97316",
        platStroke: "#9a3412",
        accent: "#f97316",
        baseSpeed: 8.4,
        parkourGoal: 370,
        bossHp: 260,
        bossReward: 220,
        boltSpeed: 9.2,
        boltCd: 36
      },
      {
        num: 3,
        name: "VOID APEX",
        bg: "#06030d",
        grid: "#170c2e",
        platFill: "#160c2b",
        platTop: "#a855f7",
        platStroke: "#6b21a8",
        accent: "#c084fc",
        baseSpeed: 9.3,
        parkourGoal: 740,
        bossHp: 360,
        bossReward: 300,
        boltSpeed: 10.5,
        boltCd: 29
      }
    ];

    const PORTAL_TYPES = [
      { mult: 1.0, label: "1.0x", color: "#38bdf8", glow: "rgba(56, 189, 248, 0.28)" },
      { mult: 1.35, label: "1.35x", color: "#4ade80", glow: "rgba(74, 222, 128, 0.32)" },
      { mult: 1.65, label: "1.65x", color: "#f43f5e", glow: "rgba(244, 63, 94, 0.35)" }
    ];

    // --- Full-Screen Overlay Shell ---
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      width: "100vw",
      height: "100vh",
      zIndex: "2147483647",
      background: "#070305",
      display: "flex",
      flexDirection: "column",
      fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      color: "#f8fafc",
      userSelect: "none",
      overflow: "hidden"
    });

    overlay.innerHTML = `
      <!-- TOP HUD BAR -->
      <div style="flex-shrink:0;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding:10px 20px;background:#14060b;border-bottom:2px solid #450a0a;font-weight:800;font-size:13px;z-index:20;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div id="scp-pips" style="display:flex;gap:5px;"></div>
          <span id="scp-miner" style="padding:3px 9px;border-radius:6px;font-size:11px;background:#1c1917;color:${RUNNER.primary};border:1px solid ${RUNNER.primary};">${RUNNER.label}</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;">
          <span id="scp-stage" style="padding:3px 10px;border-radius:6px;font-size:11px;background:#1e1b4b;color:#c7d2fe;border:1px solid #818cf8;">STAGE 1/3: CRYSTAL QUARRY</span>
          <span id="scp-spd" style="padding:3px 9px;border-radius:6px;font-size:11px;background:#082f49;color:#7dd3fc;border:1px solid #38bdf8;">SPEED: 1.0x</span>
          <span id="scp-phase" style="padding:3px 10px;border-radius:999px;font-size:11px;background:#450a0a;color:#fca5a5;border:1px solid #ef4444;">PARKOUR</span>
          <span>SCORE: <b id="scp-score" style="color:#fde047;">0</b></span>
          <span>HI: <b id="scp-hi" style="color:#4ade80;">0</b></span>
          <button id="scp-restart-btn" style="background:#1e293b;color:#f8fafc;border:1px solid #475569;border-radius:5px;padding:4px 10px;cursor:pointer;font-weight:700;font-size:11px;">RESTART</button>
          <button id="scp-mute" style="background:#1f2937;color:#e5e7eb;border:1px solid #4b5563;border-radius:5px;padding:4px 10px;cursor:pointer;font-weight:700;font-size:11px;">SFX: ON</button>
          <button id="scp-close" style="background:#15803d;color:#fff;border:1px solid #4ade80;border-radius:5px;padding:4px 10px;cursor:pointer;font-weight:800;font-size:11px;">EXIT TO QUARRY</button>
        </div>
      </div>

      <!-- MAIN FULL-SCREEN STAGE -->
      <div style="position:relative;flex:1;width:100%;height:100%;overflow:hidden;">
        <canvas id="scp-canvas" style="display:block;width:100%;height:100%;background:#090204;cursor:pointer;touch-action:none;"></canvas>
      </div>

      <!-- BOTTOM CONTROLS BAR -->
      <div style="flex-shrink:0;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;padding:8px 20px;background:#120408;border-top:1px solid #3f0d12;font-size:12px;color:#cbd5e1;z-index:20;">
        <span><b>Jump / Orb Boost / Shoot:</b> W / ↑ / Space / Click &nbsp;•&nbsp; <b>Air Shift:</b> A / D or ← / → &nbsp;•&nbsp; <b>Puzzle:</b> A+D (or E)</span>
        <span style="color:#fde047;">Clear Stage 3 to unlock <b>Chikorita</b> &amp; <b>Parkour Master</b> badge • ESC to exit</span>
      </div>
    `;

    document.body.appendChild(overlay);

    const canvas = overlay.querySelector("#scp-canvas");
    const ctx = canvas.getContext("2d");
    const pipsWrap = overlay.querySelector("#scp-pips");
    const stageEl = overlay.querySelector("#scp-stage");
    const spdEl = overlay.querySelector("#scp-spd");
    const phaseEl = overlay.querySelector("#scp-phase");
    const scoreEl = overlay.querySelector("#scp-score");
    const hiEl = overlay.querySelector("#scp-hi");
    const restartBtn = overlay.querySelector("#scp-restart-btn");
    const muteBtn = overlay.querySelector("#scp-mute");
    const closeBtn = overlay.querySelector("#scp-close");

    let W = window.innerWidth;
    let H = Math.max(320, window.innerHeight - 86);

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        W = canvas.width = Math.floor(rect.width);
        H = canvas.height = Math.floor(rect.height);
      }
    };
    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);

    const GRAVITY = 0.92;
    const JUMP_VEL = -14.6;
    const MAX_FALL = 19.5;

    let hiScore = Number(localStorage.getItem("scp_full_hi") || 0);
    hiEl.textContent = hiScore;

    const game = {
      mode: "PLAY", // PLAY | DEATH | WIN
      phase: "PARKOUR", // PARKOUR | PUZZLE | BOSS
      stageIdx: 0,
      speedMult: 1.0,
      bannerText: "",
      bannerColor: "#fde047",
      bannerTimer: 0,
      score: 0,
      scoreAcc: 0,
      hp: RUNNER.maxHp,
      maxHp: RUNNER.maxHp,
      invinc: 0,
      shake: 0,
      keys: {},
      p: { x: 150, y: 200, w: 32, h: 32, vy: 0, jumps: 0, rot: 0, trail: [] },
      plats: [],
      orbs: [],
      portals: [],
      particles: [],
      rings: [],
      shots: [],
      boss: { x: W - 150, y: H * 0.44, hp: 180, maxHp: 180, cd: 38, bolts: [] }
    };

    const getStage = () => STAGES[game.stageIdx];

    const showBanner = (text, color = "#fde047", frames = 85) => {
      game.bannerText = text;
      game.bannerColor = color;
      game.bannerTimer = frames;
    };

    const spawnParticles = (x, y, color, count = 16) => {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 2 + Math.random() * 5.8;
        game.particles.push({
          x, y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 1.5,
          size: 3 + Math.random() * 4,
          color,
          life: 22 + Math.random() * 15
        });
      }
    };

    // Renders Neil, Xavier, or Carter as the pixel miner cube
    const drawMinerCube = (targetCtx, size, profile) => {
      const half = size / 2;
      // Base outfit / armor body
      targetCtx.fillStyle = profile.primary;
      targetCtx.fillRect(-half, -half, size, size);

      // Lower tunic/armor trim
      targetCtx.fillStyle = profile.trim;
      targetCtx.fillRect(-half, half - 9, size, 9);

      if (profile.id === "neil") {
        // Miner helmet & glowing headlamp
        targetCtx.fillStyle = "#fbbf24";
        targetCtx.fillRect(-half, -half, size, 10);
        targetCtx.fillStyle = "#fef08a";
        targetCtx.fillRect(half - 8, -half + 2, 6, 6);
        // Face & hair
        targetCtx.fillStyle = profile.skin;
        targetCtx.fillRect(-half + 4, -half + 10, size - 6, 13);
        targetCtx.fillStyle = profile.hair;
        targetCtx.fillRect(-half + 2, -half + 10, 6, 7);
        // Eyes
        targetCtx.fillStyle = "#0f172a";
        targetCtx.fillRect(3, -half + 13, 4, 5);
      } else if (profile.id === "xavier") {
        // Heavy steel crusher helm & glowing visor
        targetCtx.fillStyle = "#1e293b";
        targetCtx.fillRect(-half, -half, size, 12);
        targetCtx.fillStyle = profile.skin;
        targetCtx.fillRect(-half + 4, -half + 12, size - 6, 11);
        // Heavy visor slit
        targetCtx.fillStyle = profile.visor;
        targetCtx.fillRect(-1, -half + 13, 13, 5);
        // Shoulder guard plate
        targetCtx.fillStyle = "#94a3b8";
        targetCtx.fillRect(-half, half - 11, 10, 6);
      } else {
        // Carter: Trailblazer cap/bandana & runner eyes
        targetCtx.fillStyle = "#15803d";
        targetCtx.fillRect(-half, -half, size, 9);
        // Forward cap brim
        targetCtx.fillStyle = "#4ade80";
        targetCtx.fillRect(0, -half + 6, half + 3, 4);
        // Face
        targetCtx.fillStyle = profile.skin;
        targetCtx.fillRect(-half + 4, -half + 10, size - 6, 13);
        // Scout eyes
        targetCtx.fillStyle = "#0f172a";
        targetCtx.fillRect(3, -half + 13, 4, 5);
      }

      // Crisp pixel outline
      targetCtx.strokeStyle = "#ffffff";
      targetCtx.lineWidth = 2;
      targetCtx.strokeRect(-half, -half, size, size);
    };

    const spawnSegment = () => {
      const last = game.plats[game.plats.length - 1];
      const safe = game.phase !== "PARKOUR";
      const lowY = H - 105;
      const midY = H - 170;
      const highY = H - 235;
      const choices = safe ? [lowY, midY] : [0, highY, midY, lowY];
      const pick = choices[Math.floor(Math.random() * choices.length)];

      let newPlat;
      if (pick === 0) {
        const gap = 145 + Math.random() * 75;
        const w = 165 + Math.random() * 90;
        const y = [highY, midY, lowY][Math.floor(Math.random() * 3)];
        const px = last.x + last.w + gap;
        newPlat = {
          x: px, y, w, h: H - y + 40,
          spike: Math.random() < (0.38 + game.stageIdx * 0.08),
          sx: Math.round(w * (0.45 + Math.random() * 0.25))
        };

        const isMegaOrb = Math.random() < 0.35;
        game.orbs.push({
          x: last.x + last.w + gap * 0.5,
          y: Math.min(last.y, y) - 52,
          r: 17,
          mega: isMegaOrb,
          used: false
        });
      } else {
        const gap = safe ? 30 : 75 + Math.random() * 60;
        const w = safe ? 290 : 165 + Math.random() * 105;
        const px = last.x + last.w + gap;
        newPlat = {
          x: px, y: pick, w, h: H - pick + 40,
          spike: !safe && Math.random() < (0.45 + game.stageIdx * 0.08),
          sx: Math.round(w * (0.42 + Math.random() * 0.28))
        };

        if (!safe && Math.random() < 0.42) {
          game.orbs.push({
            x: px + w * 0.5,
            y: pick - 85,
            r: 17,
            mega: Math.random() < 0.3,
            used: false
          });
        }

        if (!safe && w >= 195 && Math.random() < 0.34) {
          const candidates = PORTAL_TYPES.filter((pt) => pt.mult !== game.speedMult);
          const chosenPortal = candidates[Math.floor(Math.random() * candidates.length)];
          game.portals.push({
            x: px + w * 0.25,
            y: pick - 92,
            w: 26,
            h: 92,
            ...chosenPortal,
            triggered: false
          });
        }
      }

      game.plats.push(newPlat);
    };

    const rebuildHpPips = () => {
      const totalPips = Math.ceil(game.maxHp / 25);
      const activePips = Math.ceil(Math.max(0, game.hp) / 25);
      pipsWrap.innerHTML = "";
      for (let i = 0; i < totalPips; i++) {
        const d = document.createElement("div");
        const on = i < activePips;
        Object.assign(d.style, {
          width: "16px",
          height: "11px",
          borderRadius: "2px",
          background: on ? "#ef4444" : "#290b10",
          border: `1px solid ${on ? "#fecaca" : "#7f1d1d"}`,
          boxShadow: on ? "0 0 6px #ef4444" : "none"
        });
        pipsWrap.appendChild(d);
      }
    };

    const syncHud = () => {
      rebuildHpPips();
      const st = getStage();
      const sc = Math.floor(game.score);
      scoreEl.textContent = sc;
      if (sc > hiScore) {
        hiScore = sc;
        localStorage.setItem("scp_full_hi", String(hiScore));
      }
      hiEl.textContent = hiScore;

      stageEl.textContent = `STAGE ${st.num}/3: ${st.name}`;
      stageEl.style.borderColor = st.accent;
      stageEl.style.color = st.accent;

      const pInfo = PORTAL_TYPES.find((p) => p.mult === game.speedMult) || PORTAL_TYPES[0];
      spdEl.textContent = `SPEED: ${pInfo.label}`;
      spdEl.style.borderColor = pInfo.color;
      spdEl.style.color = pInfo.color;

      phaseEl.textContent = game.phase;
      phaseEl.style.background = game.phase === "PUZZLE" ? "#083344" : game.phase === "BOSS" ? "#3b0764" : "#450a0a";
      phaseEl.style.color = game.phase === "PUZZLE" ? "#67e8f9" : game.phase === "BOSS" ? "#f0abfc" : "#fca5a5";
      phaseEl.style.borderColor = game.phase === "PUZZLE" ? "#22d3ee" : game.phase === "BOSS" ? "#e879f9" : "#ef4444";
    };

    const initStageWorld = (keepPlayerState = false) => {
      const st = getStage();
      game.phase = "PARKOUR";
      game.speedMult = 1.0;
      game.orbs = [];
      game.portals = [];
      game.shots = [];
      game.boss = {
        x: W - 150,
        y: H * 0.44,
        hp: st.bossHp,
        maxHp: st.bossHp,
        cd: st.boltCd,
        bolts: []
      };

      if (!keepPlayerState) {
        const startY = H - 115;
        game.p = { x: 150, y: startY - 40, w: 32, h: 32, vy: 0, jumps: 0, rot: 0, trail: [] };
        game.plats = [
          { x: 0, y: startY, w: 560, h: 160, spike: false, sx: 0 },
          { x: 695, y: startY - 40, w: 220, h: 200, spike: true, sx: 115 }
        ];
        game.orbs.push({ x: 625, y: startY - 68, r: 17, mega: false, used: false });
        game.portals.push({
          x: 430, y: startY - 92, w: 26, h: 92,
          ...PORTAL_TYPES[1], triggered: false
        });
        while (game.plats[game.plats.length - 1].x < W + 450) spawnSegment();
      }
      showBanner(`STAGE ${st.num}: ${st.name}`, st.accent, 90);
    };

    const resetRun = () => {
      resizeCanvas();
      game.mode = "PLAY";
      game.stageIdx = 0;
      game.score = 0;
      game.scoreAcc = 0;
      game.maxHp = RUNNER.maxHp;
      game.hp = RUNNER.maxHp;
      game.invinc = 0;
      game.shake = 0;
      game.particles = [];
      game.rings = [];
      initStageWorld(false);
      sfx(988, 0.06);
      setTimeout(() => sfx(1319, 0.11), 65);
      syncHud();
    };

    const hurtPlayer = (hx, hy) => {
      if (game.invinc > 0) return;
      game.hp -= 50;
      game.invinc = 28;
      game.shake = 14;
      spawnParticles(hx, hy, "#ef4444", 22);
      sfx(165, 0.16, "sawtooth", 0.09);
      syncHud();
      if (game.hp <= 0) {
        game.mode = "DEATH";
        game.shake = 18;
        spawnParticles(game.p.x + 16, game.p.y + 16, RUNNER.primary, 36);
        sfx(100, 0.24, "sawtooth", 0.1);
      }
    };

    const unlockPuzzle = () => {
      if (game.mode !== "PLAY" || game.phase !== "PUZZLE") return;
      game.phase = "BOSS";
      game.shake = 10;
      spawnParticles(W / 2, H * 0.36, "#22d3ee", 28);
      showBanner(`STAGE ${getStage().num} BOSS ENGAGED!`, "#f0abfc", 70);
      sfx(523, 0.06);
      setTimeout(() => sfx(659, 0.06), 60);
      setTimeout(() => sfx(784, 0.12), 120);
      syncHud();
    };

    const actionJump = () => {
      if (game.mode === "WIN") {
        cleanup();
        return;
      }
      if (game.mode !== "PLAY") {
        resetRun();
        return;
      }

      const p = game.p;
      const pcx = p.x + p.w / 2;
      const pcy = p.y + p.h / 2;

      let hitOrb = false;
      for (const orb of game.orbs) {
        if (!orb.used && Math.hypot(pcx - orb.x, pcy - orb.y) <= orb.r + 34) {
          orb.used = true;
          hitOrb = true;
          p.vy = orb.mega ? -17.6 : -15.2;
          p.jumps = 1;
          game.score += Math.round((orb.mega ? 12 : 6) * RUNNER.scoreMult);
          const col = orb.mega ? "#22d3ee" : "#facc15";
          game.rings.push({ x: orb.x, y: orb.y, r: 10, color: col, life: 18 });
          spawnParticles(orb.x, orb.y, col, 16);
          sfx(orb.mega ? 1180 : 940, 0.07, "triangle", 0.08);
          syncHud();
          break;
        }
      }

      if (!hitOrb && p.jumps < RUNNER.maxJumps) {
        p.vy = JUMP_VEL;
        p.jumps += 1;
        game.rings.push({ x: pcx, y: p.y + p.h, r: 6, color: RUNNER.primary, life: 14 });
        sfx(p.jumps === 1 ? 660 : 880, 0.045);
      }

      if (game.phase === "BOSS") {
        game.shots.push({
          x: p.x + p.w,
          y: pcy,
          vx: 16,
          vy: (game.boss.y - pcy) * 0.025
        });
        sfx(520, 0.035, "sawtooth");
      }
    };

    // --- Event Listeners ---
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === "escape") {
        cleanup();
        return;
      }
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "w", "a", "s", "d", "e"].includes(k)) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!game.keys[k]) {
        if (k === "w" || k === "arrowup" || k === " ") actionJump();
        if (k === "e") unlockPuzzle();
      }
      game.keys[k] = true;
      if ((game.keys["a"] || game.keys["arrowleft"]) && (game.keys["d"] || game.keys["arrowright"])) {
        unlockPuzzle();
      }
    };

    const onKeyUp = (e) => {
      game.keys[e.key.toLowerCase()] = false;
    };

    const onCanvasClick = (e) => {
      if (game.mode === "PLAY" && game.phase === "PUZZLE") {
        const r = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const cx = ((clientX - r.left) / r.width) * W;
        const cy = ((clientY - r.top) / r.height) * H;
        if (Math.hypot(cx - W / 2, cy - H * 0.36) < 85) {
          unlockPuzzle();
          return;
        }
      }
      actionJump();
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    canvas.addEventListener("mousedown", onCanvasClick);
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      onCanvasClick(e);
    }, { passive: false });

    restartBtn.onclick = resetRun;
    muteBtn.onclick = () => {
      muted = !muted;
      muteBtn.textContent = muted ? "SFX: OFF" : "SFX: ON";
    };
    closeBtn.onclick = () => cleanup();

    // --- Main Simulation Step ---
    const update = () => {
      if (game.shake > 0) game.shake *= 0.85;
      if (game.bannerTimer > 0) game.bannerTimer--;

      for (let i = game.particles.length - 1; i >= 0; i--) {
        const pt = game.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.22;
        if (--pt.life <= 0) game.particles.splice(i, 1);
      }
      for (let i = game.rings.length - 1; i >= 0; i--) {
        const rg = game.rings[i];
        rg.r += 2.8;
        if (--rg.life <= 0) game.rings.splice(i, 1);
      }

      if (game.mode !== "PLAY") return;

      const st = getStage();
      const p = game.p;
      if (game.invinc > 0) game.invinc--;

      const left = game.keys["a"] || game.keys["arrowleft"];
      const right = game.keys["d"] || game.keys["arrowright"];
      const maxShiftX = Math.min(440, W * 0.42);
      if (left && !right) p.x = Math.max(55, p.x - RUNNER.airSpeed);
      if (right && !left) p.x = Math.min(maxShiftX, p.x + RUNNER.airSpeed);

      const prevBottom = p.y + p.h;
      p.vy = Math.min(MAX_FALL, p.vy + GRAVITY);
      p.y += p.vy;

      const currentScroll = st.baseSpeed * game.speedMult;
      for (const pl of game.plats) pl.x -= currentScroll;
      for (const orb of game.orbs) orb.x -= currentScroll;
      for (const pt of game.portals) pt.x -= currentScroll;

      while (game.plats.length && game.plats[0].x + game.plats[0].w < -140) game.plats.shift();
      while (game.orbs.length && game.orbs[0].x < -80) game.orbs.shift();
      while (game.portals.length && game.portals[0].x + game.portals[0].w < -80) game.portals.shift();
      while (game.plats[game.plats.length - 1].x < W + 450) spawnSegment();

      for (const pt of game.portals) {
        if (!pt.triggered &&
            p.x + p.w > pt.x &&
            p.x < pt.x + pt.w &&
            p.y + p.h > pt.y &&
            p.y < pt.y + pt.h) {
          pt.triggered = true;
          game.speedMult = pt.mult;
          game.shake = 6;
          game.rings.push({ x: pt.x + pt.w / 2, y: pt.y + pt.h / 2, r: 12, color: pt.color, life: 20 });
          spawnParticles(pt.x + pt.w / 2, pt.y + pt.h / 2, pt.color, 18);
          showBanner(`SPEED PORTAL: ${pt.label}`, pt.color, 55);
          sfx(pt.mult > 1.4 ? 1046 : pt.mult > 1.1 ? 880 : 587, 0.09, "sawtooth", 0.07);
          syncHud();
        }
      }

      let grounded = false;
      for (const pl of game.plats) {
        if (p.x + p.w - 4 > pl.x && p.x + 4 < pl.x + pl.w && p.vy >= 0 && prevBottom <= pl.y + 15 && p.y + p.h >= pl.y) {
          p.y = pl.y - p.h;
          p.vy = 0;
          p.jumps = 0;
          grounded = true;
        }
        if (pl.spike) {
          const sx = pl.x + pl.sx;
          if (p.x + p.w - 6 > sx - 10 && p.x + 6 < sx + 10 && p.y + p.h - 4 > pl.y - 22 && p.y + 6 < pl.y) {
            hurtPlayer(sx, pl.y - 10);
            if (game.mode !== "PLAY") return;
          }
        }
      }

      p.rot = grounded ? Math.round(p.rot / (Math.PI / 2)) * (Math.PI / 2) : p.rot + 0.14 * game.speedMult;
      p.trail.push({ x: p.x, y: p.y, rot: p.rot });
      if (p.trail.length > (game.speedMult > 1.2 ? 12 : 8)) p.trail.shift();

      if (p.y > H + 10) {
        game.mode = "DEATH";
        game.shake = 18;
        spawnParticles(p.x + 16, H - 15, RUNNER.primary, 34);
        sfx(100, 0.24, "sawtooth", 0.1);
        syncHud();
        return;
      }

      if (game.phase === "PARKOUR") {
        game.scoreAcc += currentScroll * 0.032 * RUNNER.scoreMult;
        if (game.scoreAcc >= 1) {
          const add = Math.floor(game.scoreAcc);
          game.score += add;
          game.scoreAcc -= add;
          if (game.score >= st.parkourGoal) {
            game.score = st.parkourGoal;
            game.phase = "PUZZLE";
            sfx(740, 0.09);
          }
          syncHud();
        }
      } else if (game.phase === "BOSS") {
        const b = game.boss;
        b.x = W - 150;
        b.y = H * 0.44 + Math.sin(Date.now() * (0.0045 + game.stageIdx * 0.001)) * (H * 0.16);
        if (--b.cd <= 0) {
          b.cd = st.boltCd;
          const ang = Math.atan2(p.y + 16 - b.y, p.x + 16 - b.x);
          b.bolts.push({
            x: b.x - 30,
            y: b.y,
            vx: Math.cos(ang) * st.boltSpeed,
            vy: Math.sin(ang) * st.boltSpeed
          });
        }

        for (let i = b.bolts.length - 1; i >= 0; i--) {
          const bt = b.bolts[i];
          bt.x += bt.vx;
          bt.y += bt.vy;
          if (Math.hypot(bt.x - (p.x + 16), bt.y - (p.y + 16)) < 18) {
            b.bolts.splice(i, 1);
            hurtPlayer(p.x + 16, p.y + 16);
            if (game.mode !== "PLAY") return;
          } else if (bt.x < -25) {
            b.bolts.splice(i, 1);
          }
        }

        for (let i = game.shots.length - 1; i >= 0; i--) {
          const sh = game.shots[i];
          sh.x += sh.vx;
          sh.y += sh.vy;
          if (Math.hypot(sh.x - b.x, sh.y - b.y) < 44) {
            game.shots.splice(i, 1);
            b.hp -= RUNNER.bossDmg;
            game.score += Math.round(RUNNER.bossDmg * RUNNER.scoreMult);
            game.shake = 6;
            spawnParticles(b.x - 20, b.y, "#f0abfc", 14);
            sfx(300, 0.06, "square");
            syncHud();

            if (b.hp <= 0) {
              game.score += Math.round(st.bossReward * RUNNER.scoreMult);
              spawnParticles(b.x, b.y, "#fde047", 45);
              sfx(523, 0.07);
              setTimeout(() => sfx(659, 0.07), 70);
              setTimeout(() => sfx(1046, 0.16), 140);

              if (game.stageIdx < STAGES.length - 1) {
                game.stageIdx += 1;
                game.hp = Math.min(game.maxHp, game.hp + 50);
                initStageWorld(true);
                syncHud();
              } else {
                game.mode = "WIN";
                triggerRockChopperRewards();
                syncHud();
              }
              return;
            }
          } else if (sh.x > W + 30) {
            game.shots.splice(i, 1);
          }
        }
      }
    };

    // --- Render Frame ---
    const draw = () => {
      const st = getStage();
      ctx.save();
      if (game.shake > 0.4) {
        ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
      }

      ctx.fillStyle = st.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = st.grid;
      ctx.lineWidth = 1;
      const gridOff = (Date.now() * 0.08 * game.speedMult) % 44;
      for (let x = -gridOff; x < W; x += 44) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 44) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      if (game.mode === "PLAY" && game.speedMult > 1.1) {
        ctx.strokeStyle = game.speedMult > 1.5 ? "rgba(244, 63, 94, 0.25)" : "rgba(74, 222, 128, 0.2)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
          const ly = ((i * 73 + Math.floor(Date.now() * 0.1)) % H);
          const lx = W - ((Date.now() * (0.9 * game.speedMult) + i * 190) % (W + 200));
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + 95, ly);
          ctx.stroke();
        }
      }

      const lava = ctx.createLinearGradient(0, H - 40, 0, H);
      lava.addColorStop(0, "rgba(0,0,0,0)");
      lava.addColorStop(1, st.accent + "66");
      ctx.fillStyle = lava;
      ctx.fillRect(0, H - 40, W, 40);

      for (const pl of game.plats) {
        ctx.fillStyle = st.platFill;
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.fillStyle = st.platTop;
        ctx.fillRect(pl.x, pl.y, pl.w, 4);
        ctx.strokeStyle = st.platStroke;
        ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);

        if (pl.spike) {
          const sx = pl.x + pl.sx;
          ctx.fillStyle = "#ff3b30";
          ctx.beginPath();
          ctx.moveTo(sx - 12, pl.y);
          ctx.lineTo(sx, pl.y - 24);
          ctx.lineTo(sx + 12, pl.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#fecaca";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      for (const pt of game.portals) {
        ctx.save();
        ctx.fillStyle = pt.glow;
        ctx.fillRect(pt.x, pt.y, pt.w, pt.h);
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(pt.x, pt.y, pt.w, pt.h);

        ctx.fillStyle = pt.color;
        ctx.font = "900 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(pt.label, pt.x + pt.w / 2, pt.y - 8);
        ctx.restore();
      }

      for (const orb of game.orbs) {
        const col = orb.mega ? "#22d3ee" : "#facc15";
        const pulse = 1 + Math.sin(Date.now() * 0.012 + orb.x) * 0.14;
        ctx.save();
        ctx.translate(orb.x, orb.y);
        ctx.globalAlpha = orb.used ? 0.25 : 1;
        ctx.strokeStyle = col;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, orb.r * pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(0, 0, orb.r * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const rg of game.rings) {
        ctx.save();
        ctx.strokeStyle = rg.color;
        ctx.globalAlpha = Math.max(0, rg.life / 18);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (game.mode === "PLAY" && game.phase === "PUZZLE") {
        const py = H * 0.36;
        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.12;
        ctx.save();
        ctx.translate(W / 2, py);
        ctx.scale(pulse, pulse);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "rgba(34, 211, 238, 0.25)";
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 3;
        ctx.fillRect(-26, -26, 52, 52);
        ctx.strokeRect(-26, -26, 52, 52);
        ctx.restore();

        ctx.fillStyle = "#67e8f9";
        ctx.font = "800 15px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`STAGE ${st.num} PUZZLE: PRESS [A + D] / [E] OR CLICK DIAMOND`, W / 2, py + 62);
      }

      if (game.mode === "PLAY" && game.phase === "BOSS") {
        const b = game.boss;
        const isSkull = Math.floor(Date.now() / 120) % 2 === 0;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.fillStyle = isSkull ? "#581c87" : "#991b1b";
        ctx.strokeStyle = "#f0abfc";
        ctx.lineWidth = 3;
        ctx.fillRect(-36, -36, 72, 72);
        ctx.strokeRect(-36, -36, 72, 72);

        ctx.fillStyle = "#fde047";
        if (isSkull) {
          ctx.fillRect(-18, -12, 12, 12);
          ctx.fillRect(6, -12, 12, 12);
          ctx.fillRect(-14, 12, 28, 7);
        } else {
          for (let r = -24; r < 24; r += 16) {
            for (let c = -24; c < 24; c += 16) {
              if ((r + c) % 32 === 0) ctx.fillRect(c, r, 12, 12);
            }
          }
        }
        ctx.restore();

        ctx.fillStyle = "#1f2937";
        ctx.fillRect(W / 2 - 150, 20, 300, 12);
        ctx.fillStyle = "#e879f9";
        ctx.fillRect(W / 2 - 150, 20, 300 * Math.max(0, b.hp / b.maxHp), 12);
        ctx.strokeStyle = "#f5d0fe";
        ctx.strokeRect(W / 2 - 150, 20, 300, 12);

        ctx.fillStyle = "#f43f5e";
        for (const bt of b.bolts) {
          ctx.beginPath();
          ctx.arc(bt.x, bt.y, 7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = RUNNER.primary;
        for (const sh of game.shots) {
          ctx.fillRect(sh.x - 10, sh.y - 3, 20, 6);
        }
      }

      if (game.mode !== "DEATH") {
        const p = game.p;
        p.trail.forEach((t, idx) => {
          ctx.save();
          ctx.translate(t.x + p.w / 2, t.y + p.h / 2);
          ctx.rotate(t.rot);
          ctx.globalAlpha = (idx + 1) * 0.045;
          ctx.fillStyle = RUNNER.primary;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });

        if (game.invinc % 4 < 2) {
          ctx.save();
          ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
          ctx.rotate(p.rot);
          drawMinerCube(ctx, p.w, RUNNER);
          ctx.restore();
        }
      }

      for (const pt of game.particles) {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      }

      if (game.mode === "PLAY" && game.bannerTimer > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, game.bannerTimer / 20);
        ctx.fillStyle = game.bannerColor;
        ctx.font = "900 22px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(game.bannerText, W / 2, 66);
        ctx.restore();
      }

      if (game.mode === "DEATH" || game.mode === "WIN") {
        ctx.fillStyle = "rgba(9, 2, 4, 0.80)";
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";

        if (game.mode === "DEATH") {
          ctx.fillStyle = "#ff3b30";
          ctx.font = "900 44px system-ui, sans-serif";
          ctx.fillText("SHATTERED", W / 2, H / 2 - 30);
          ctx.fillStyle = "#fde047";
          ctx.font = "800 18px system-ui, sans-serif";
          ctx.fillText(`STAGE ${st.num}/3   •   SCORE: ${Math.floor(game.score)}   •   HI: ${hiScore}`, W / 2, H / 2 + 8);
          ctx.fillStyle = "#cbd5e1";
          ctx.font = "700 14px system-ui, sans-serif";
          ctx.fillText("PRESS [SPACE] OR CLICK TO RETRY", W / 2, H / 2 + 42);
        } else {
          ctx.fillStyle = "#4ade80";
          ctx.font = "900 42px system-ui, sans-serif";
          ctx.fillText("ALL 3 STAGES CLEARED!", W / 2, H / 2 - 58);

          ctx.fillStyle = "#86efac";
          ctx.font = "900 20px system-ui, sans-serif";
          ctx.fillText("🌿 REWARD UNLOCKED: PARKOUR CHIKORITA PET", W / 2, H / 2 - 16);

          ctx.fillStyle = "#fde047";
          ctx.font = "900 18px system-ui, sans-serif";
          ctx.fillText("🏅 BADGE EARNED: PARKOUR MASTER", W / 2, H / 2 + 16);

          ctx.fillStyle = "#cbd5e1";
          ctx.font = "700 14px system-ui, sans-serif";
          ctx.fillText(`FINAL SCORE: ${Math.floor(game.score)}   •   CLICK OR PRESS [SPACE] / [ESC] TO RETURN TO QUARRY`, W / 2, H / 2 + 56);
        }
      }

      ctx.restore();
    };

    let rafId = null;
    const loop = () => {
      update();
      draw();
      rafId = requestAnimationFrame(loop);
    };

    const cleanup = () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      canvas.removeEventListener("mousedown", onCanvasClick);
      overlay.remove();
      if (audioCtx) audioCtx.close().catch(() => {});
      delete window.__scParkourCleanup;
    };

    window.__scParkourCleanup = cleanup;
    resetRun();
    loop();
  }

  // Intercept Rock Chopper's "Enter Parkour" button once unlocked in the Quarry
  document.addEventListener("DOMContentLoaded", () => {
    const parkourBtn = document.getElementById("toggleParkourBtn");
    if (parkourBtn) {
      parkourBtn.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          launchSmashCenterParkour();
        },
        true
      );
    }
  });

  window.launchSmashCenterParkour = launchSmashCenterParkour;
})();
