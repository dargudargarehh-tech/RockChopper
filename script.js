(() => {
  const SAVE_KEY = "rock_chopper_save_v1";
  const game = document.getElementById("rock-chopper-game");
  const canvas = game.querySelector("#mineCanvas");
  const ctx = canvas.getContext("2d");

  // Full-color Emoji Canvas Font Helper
  const EMOJI_FONT = (px) => `${px}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;

  // Character Definitions
  const characters = {
    neil: {
      name: "Neil",
      avatar: "🧒🏽",
      baseHp: 110,
      baseAtk: 6,
      speed: 3.4,
      lootMult: 1.3
    },
    xavier: {
      name: "Xavier",
      avatar: "🧑🏾‍🎤",
      baseHp: 145,
      baseAtk: 9,
      speed: 3.1,
      lootMult: 1.0
    },
    carter: {
      name: "Carter",
      avatar: "👱🏻‍♂️",
      baseHp: 95,
      baseAtk: 6,
      speed: 4.5,
      lootMult: 1.1
    }
  };

  // Quarry Pets Catalog
  const PET_CATALOG = {
    potato_rock: {
      id: "potato_rock",
      name: "Potato Rock",
      rarity: "Common",
      color: "#d97706",
      desc: "A bumpy spud-shaped boulder. Boosts Gold & ore sell value by +15%.",
      hatchWeight: 45,
      atkBonus: 0,
      hpBonus: 0,
      speedBonus: 0,
      lootBonus: 0.15
    },
    chungo: {
      id: "chungo",
      name: "Chungo",
      rarity: "Uncommon",
      color: "#f472b6",
      desc: "A Diglett-shaped piece of pink quartz. Boosts movement speed (+0.7).",
      hatchWeight: 30,
      atkBonus: 0,
      hpBonus: 0,
      speedBonus: 0.7,
      lootBonus: 0
    },
    slab: {
      id: "slab",
      name: "Slab",
      rarity: "Rare",
      color: "#38bdf8",
      desc: "A sturdy flat slab of quarry stone. Adds +6 ATK and +35 Max HP.",
      hatchWeight: 18,
      atkBonus: 6,
      hpBonus: 35,
      speedBonus: 0,
      lootBonus: 0
    },
    grail: {
      id: "grail",
      name: "Grail",
      rarity: "Epic",
      color: "#c084fc",
      desc: "A hovering mini meteor! Adds +15 ATK, +25% Gold, and +0.4 Speed.",
      hatchWeight: 7,
      atkBonus: 15,
      hpBonus: 20,
      speedBonus: 0.4,
      lootBonus: 0.25
    }
  };

  // Pickaxe Material Tiers
  const PICKAXE_MATERIALS = [
    { name: "Wood Pickaxe", color: "#b45309", atkBonus: 0, cost: 20 },
    { name: "Stone Pickaxe", color: "#9ca3af", atkBonus: 4, cost: 45 },
    { name: "Copper Pickaxe", color: "#ea580c", atkBonus: 9, cost: 95 },
    { name: "Iron Pickaxe", color: "#e2e8f0", atkBonus: 16, cost: 180 },
    { name: "Gold Pickaxe", color: "#facc15", atkBonus: 25, cost: 340 },
    { name: "Diamond Pickaxe", color: "#38bdf8", atkBonus: 38, cost: 620 },
    { name: "Obsidian Pickaxe", color: "#6366f1", atkBonus: 55, cost: 1100 },
    { name: "Mythril Pickaxe", color: "#34d399", atkBonus: 78, cost: 1950 },
    { name: "Voidsteel Pickaxe", color: "#f43f5e", atkBonus: 110, cost: 3400 },
    { name: "Celestial Pickaxe", color: "#fef08a", atkBonus: 155, cost: 6000 },
    { name: "Apex Purple Pickaxe", color: "#a855f7", atkBonus: 220, cost: null }
  ];

  // 11 Rock Rarity Tiers
  const RARITIES = [
    {
      id: "common",
      label: "Common",
      color: "#9ca3af",
      rockFill: "#6b7280",
      rockTop: "#9ca3af",
      fleck: "#d1d5db",
      hpMult: 1.0,
      xp: 4,
      dropType: "stone",
      dropCount: 1,
      goldBonus: 0,
      eggChance: 0.08,
      dropEmoji: "🪨"
    },
    {
      id: "uncommon",
      label: "Uncommon",
      color: "#4ade80",
      rockFill: "#4b5563",
      rockTop: "#4ade80",
      fleck: "#86efac",
      hpMult: 1.5,
      xp: 8,
      dropType: "iron",
      dropCount: 2,
      goldBonus: 0,
      eggChance: 0.14,
      dropEmoji: "🔩"
    },
    {
      id: "rare",
      label: "Rare",
      color: "#38bdf8",
      rockFill: "#334155",
      rockTop: "#38bdf8",
      fleck: "#bae6fd",
      hpMult: 2.2,
      xp: 14,
      dropType: "gem",
      dropCount: 1,
      goldBonus: 5,
      eggChance: 0.22,
      dropEmoji: "💎"
    },
    {
      id: "epic",
      label: "Epic",
      color: "#c084fc",
      rockFill: "#3b2854",
      rockTop: "#c084fc",
      fleck: "#f0abfc",
      hpMult: 3.1,
      xp: 24,
      dropType: "gem",
      dropCount: 3,
      goldBonus: 12,
      eggChance: 0.32,
      dropEmoji: "💎"
    },
    {
      id: "mythic",
      label: "Mythic",
      color: "#fbbf24",
      rockFill: "#78350f",
      rockTop: "#fbbf24",
      fleck: "#fef08a",
      hpMult: 4.4,
      xp: 40,
      dropType: "gem",
      dropCount: 5,
      goldBonus: 25,
      eggChance: 0.45,
      dropEmoji: "👑"
    },
    {
      id: "exotic",
      label: "Exotic",
      color: "#f43f5e",
      rockFill: "#4c0519",
      rockTop: "#f43f5e",
      fleck: "#fda4af",
      hpMult: 6.0,
      xp: 65,
      dropType: "gem",
      dropCount: 8,
      goldBonus: 45,
      eggChance: 0.58,
      dropEmoji: "🌺"
    },
    {
      id: "secret",
      label: "Secret",
      color: "#14b8a6",
      rockFill: "#042f2e",
      rockTop: "#2dd4bf",
      fleck: "#99f6e4",
      hpMult: 8.0,
      xp: 95,
      dropType: "gem",
      dropCount: 12,
      goldBonus: 75,
      eggChance: 0.70,
      dropEmoji: "🗝️"
    },
    {
      id: "divine",
      label: "Divine",
      color: "#fef08a",
      rockFill: "#422006",
      rockTop: "#fef08a",
      fleck: "#ffffff",
      hpMult: 10.5,
      xp: 140,
      dropType: "gem",
      dropCount: 18,
      goldBonus: 120,
      eggChance: 0.80,
      dropEmoji: "👼"
    },
    {
      id: "galactic",
      label: "Galactic",
      color: "#818cf8",
      rockFill: "#1e1b4b",
      rockTop: "#818cf8",
      fleck: "#e0e7ff",
      hpMult: 13.5,
      xp: 200,
      dropType: "gem",
      dropCount: 26,
      goldBonus: 190,
      eggChance: 0.90,
      dropEmoji: "🌌"
    },
    {
      id: "glitched",
      label: "Glitched",
      color: "#22d3ee",
      rockFill: "#0f172a",
      rockTop: "#22d3ee",
      fleck: "#f43f5e",
      hpMult: 17.0,
      xp: 290,
      dropType: "gem",
      dropCount: 38,
      goldBonus: 300,
      eggChance: 0.95,
      dropEmoji: "👾"
    },
    {
      id: "apex_purple",
      label: "Apex Purple",
      color: "#a855f7",
      rockFill: "#2e1065",
      rockTop: "#c084fc",
      fleck: "#f5d0fe",
      hpMult: 22.0,
      xp: 450,
      dropType: "gem",
      dropCount: 55,
      goldBonus: 500,
      eggChance: 1.0,
      dropEmoji: "🔮"
    }
  ];

  // World Config
  const TILE = 48;
  const COLS = 28;
  const ROWS = 20;

  const state = {
    started: false,
    selectedChar: "neil",
    pickTier: 0,
    level: 1,
    xp: 0,
    nextXp: 30,
    gold: 0,
    floor: 1,
    maxHp: 110,
    hp: 110,
    bonusHp: 0,
    bonusSpeed: 0,
    stone: 0,
    iron: 0,
    gems: 0,
    eggs: 0,
    ownedPets: {
      potato_rock: 0,
      chungo: 0,
      slab: 0,
      grail: 0
    },
    equippedPet: null,
    armorCost: 25,
    bootsCost: 30,
    touchVisible: true,
    player: {
      x: TILE * 2.5,
      y: TILE * 2.5,
      dirX: 1,
      dirY: 0,
      swingTimer: 0,
      invuln: 0
    },
    petPos: {
      x: TILE * 2.0,
      y: TILE * 2.5
    },
    grid: [],
    trees: [],
    tracks: [],
    enemies: [],
    drops: [],
    particles: [],
    floatingTexts: [],
    keys: {},
    touchDirs: { up: false, down: false, left: false, right: false }
  };

  // =========================================================
  // PROGRESS SAVER (localStorage)
  // =========================================================
  function saveProgress(showNotice = false) {
    try {
      const payload = {
        selectedChar: state.selectedChar,
        pickTier: state.pickTier,
        level: state.level,
        xp: state.xp,
        nextXp: state.nextXp,
        gold: state.gold,
        floor: state.floor,
        hp: state.hp,
        bonusHp: state.bonusHp,
        bonusSpeed: state.bonusSpeed,
        stone: state.stone,
        iron: state.iron,
        gems: state.gems,
        eggs: state.eggs,
        ownedPets: state.ownedPets,
        equippedPet: state.equippedPet,
        armorCost: state.armorCost,
        bootsCost: state.bootsCost,
        touchVisible: state.touchVisible
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      if (showNotice) addLog("💾 Progress saved!");
    } catch (err) {
      // Ignore storage quota errors in restricted frames
    }
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.selectedChar && characters[data.selectedChar]) state.selectedChar = data.selectedChar;
      if (typeof data.pickTier === "number") state.pickTier = Math.min(PICKAXE_MATERIALS.length - 1, Math.max(0, data.pickTier));
      if (typeof data.level === "number") state.level = Math.max(1, data.level);
      if (typeof data.xp === "number") state.xp = Math.max(0, data.xp);
      if (typeof data.nextXp === "number") state.nextXp = Math.max(30, data.nextXp);
      if (typeof data.gold === "number") state.gold = Math.max(0, data.gold);
      if (typeof data.floor === "number") state.floor = Math.max(1, data.floor);
      if (typeof data.bonusHp === "number") state.bonusHp = Math.max(0, data.bonusHp);
      if (typeof data.bonusSpeed === "number") state.bonusSpeed = Math.max(0, data.bonusSpeed);
      if (typeof data.stone === "number") state.stone = Math.max(0, data.stone);
      if (typeof data.iron === "number") state.iron = Math.max(0, data.iron);
      if (typeof data.gems === "number") state.gems = Math.max(0, data.gems);
      if (typeof data.eggs === "number") state.eggs = Math.max(0, data.eggs);
      if (data.ownedPets && typeof data.ownedPets === "object") {
        for (const k of Object.keys(state.ownedPets)) {
          if (typeof data.ownedPets[k] === "number") state.ownedPets[k] = Math.max(0, data.ownedPets[k]);
        }
      }
      if (data.equippedPet && PET_CATALOG[data.equippedPet] && state.ownedPets[data.equippedPet] > 0) {
        state.equippedPet = data.equippedPet;
      }
      if (typeof data.armorCost === "number") state.armorCost = Math.max(25, data.armorCost);
      if (typeof data.bootsCost === "number") state.bootsCost = Math.max(30, data.bootsCost);
      if (typeof data.touchVisible === "boolean") state.touchVisible = data.touchVisible;

      state.maxHp = getTotalMaxHp();
      state.hp = typeof data.hp === "number" ? Math.min(state.maxHp, Math.max(1, data.hp)) : state.maxHp;

      game.querySelectorAll(".char-card").forEach((c) => {
        c.classList.toggle("selected", c.dataset.char === state.selectedChar);
      });
      game.querySelector("#touchControls").classList.toggle("hidden", !state.touchVisible);
      game.querySelector("#toggleTouchBtn").innerHTML = `<span class="emoji-color">📱</span> Touch: ${state.touchVisible ? "ON" : "OFF"}`;
      return true;
    } catch (err) {
      return false;
    }
  }

  function resetProgress() {
    localStorage.removeItem(SAVE_KEY);
    state.selectedChar = "neil";
    state.pickTier = 0;
    state.level = 1;
    state.xp = 0;
    state.nextXp = 30;
    state.gold = 0;
    state.floor = 1;
    state.bonusHp = 0;
    state.bonusSpeed = 0;
    state.stone = 0;
    state.iron = 0;
    state.gems = 0;
    state.eggs = 0;
    state.ownedPets = { potato_rock: 0, chungo: 0, slab: 0, grail: 0 };
    state.equippedPet = null;
    state.armorCost = 25;
    state.bootsCost = 30;
    applyCharacterStats(true);
    generateFloor();
    addLog("🗑️ Save data reset to fresh game.");
  }

  function getActiveChar() {
    return characters[state.selectedChar];
  }

  function getActivePet() {
    return state.equippedPet ? PET_CATALOG[state.equippedPet] : null;
  }

  function getActivePickaxe() {
    return PICKAXE_MATERIALS[state.pickTier];
  }

  function getTotalAtk() {
    const pet = getActivePet();
    return getActiveChar().baseAtk + getActivePickaxe().atkBonus + (state.level - 1) * 2 + (pet ? pet.atkBonus : 0);
  }

  function getTotalMaxHp() {
    const pet = getActivePet();
    return getActiveChar().baseHp + state.bonusHp + (state.level - 1) * 15 + (pet ? pet.hpBonus : 0);
  }

  function getTotalSpeed() {
    const pet = getActivePet();
    return getActiveChar().speed + state.bonusSpeed + (pet ? pet.speedBonus : 0);
  }

  function getTotalLootMult() {
    const pet = getActivePet();
    return getActiveChar().lootMult + (pet ? pet.lootBonus : 0);
  }

  function getSellValue() {
    const mult = getTotalLootMult();
    return Math.round((state.stone * 3 + state.iron * 9 + state.gems * 24) * mult);
  }

  function applyCharacterStats(resetHp = true) {
    const ch = getActiveChar();
    state.maxHp = getTotalMaxHp();
    if (resetHp || state.hp > state.maxHp) {
      state.hp = state.maxHp;
    }
    game.querySelector("#activeMinerBadge").innerHTML = `<span class="emoji-color">${ch.avatar}</span> ${ch.name}`;
    updateUI();
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
    }
  }
  window.addEventListener("resize", resizeCanvas);

  function addLog(msg) {
    const log = game.querySelector("#combatLog");
    const line = document.createElement("div");
    line.textContent = "> " + msg;
    log.prepend(line);
    if (log.children.length > 25) log.lastChild.remove();
  }

  function addFloatingText(x, y, text, color = "#fbbf24") {
    state.floatingTexts.push({ x, y, text, color, life: 48 });
  }

  function spawnRockParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 2.8;
      state.particles.push({
        x: Math.round(x),
        y: Math.round(y),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: 4,
        color,
        life: 22 + Math.random() * 10
      });
    }
  }

  function gainXp(amount) {
    state.xp += amount;
    while (state.xp >= state.nextXp) {
      state.xp -= state.nextXp;
      state.level += 1;
      state.nextXp = Math.round(state.nextXp * 1.45);
      state.maxHp = getTotalMaxHp();
      state.hp = state.maxHp;
      addLog(`LEVEL UP! ${getActiveChar().name} reached LV.${state.level}!`);
      addFloatingText(state.player.x, state.player.y - 24, "LEVEL UP!", "#38bdf8");
    }
  }

  // =========================================================
  // EGG HATCHING & PET ROSTER UI
  // =========================================================
  function hatchEgg() {
    if (state.eggs <= 0) return;
    state.eggs -= 1;

    const list = Object.values(PET_CATALOG);
    const totalWeight = list.reduce((sum, p) => sum + p.hatchWeight, 0);
    let roll = Math.random() * totalWeight;
    let hatched = list[0];

    for (const pet of list) {
      roll -= pet.hatchWeight;
      if (roll <= 0) {
        hatched = pet;
        break;
      }
    }

    state.ownedPets[hatched.id] = (state.ownedPets[hatched.id] || 0) + 1;
    if (!state.equippedPet) {
      state.equippedPet = hatched.id;
      state.maxHp = getTotalMaxHp();
      state.hp = Math.min(state.maxHp, state.hp + hatched.hpBonus);
    }

    const speech = game.querySelector("#petHatchSpeech");
    if (speech) {
      speech.innerHTML = `🐣 Your Quarry Egg cracked open and hatched <b style="color:${hatched.color};">${hatched.name}</b> (${hatched.rarity})!`;
    }
    addLog(`🐣 Hatched ${hatched.name} (${hatched.rarity}) from a Quarry Egg!`);
    addFloatingText(state.player.x, state.player.y - 28, `HATCHED ${hatched.name.toUpperCase()}!`, hatched.color);
    saveProgress();
    updateUI();
  }

  function equipPet(petId) {
    if (petId && (!PET_CATALOG[petId] || state.ownedPets[petId] <= 0)) return;
    state.equippedPet = petId;
    state.maxHp = getTotalMaxHp();
    if (state.hp > state.maxHp) state.hp = state.maxHp;
    saveProgress();
    updateUI();
  }

  function renderPetRoster() {
    const grid = game.querySelector("#petRosterGrid");
    if (!grid) return;
    grid.innerHTML = "";

    for (const pet of Object.values(PET_CATALOG)) {
      const count = state.ownedPets[pet.id] || 0;
      const isEquipped = state.equippedPet === pet.id;

      const card = document.createElement("div");
      card.className = "shop-item" + (isEquipped ? " equipped-pet" : "");
      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:900; font-size:15px; color:${pet.color};">${pet.name}</span>
            <span style="font-size:11px; font-weight:900; color:#cbd5e1;">Owned: ${count}</span>
          </div>
          <div style="font-size:11px; font-weight:800; color:${pet.color}; text-transform:uppercase; margin-top:2px;">${pet.rarity} Companion</div>
          <div style="font-size:12px; color:#cbd5e1; margin-top:6px;">${pet.desc}</div>
        </div>
        <button class="mini-btn ${isEquipped ? "secondary" : ""}" ${count === 0 ? "disabled" : ""}>
          ${count === 0 ? "LOCKED (HATCH EGGS)" : isEquipped ? "★ EQUIPPED" : "EQUIP COMPANION"}
        </button>
      `;

      const btn = card.querySelector("button");
      btn.addEventListener("click", () => {
        if (count > 0) {
          equipPet(pet.id);
          addLog(`🐾 Equipped ${pet.name}!`);
        }
      });

      grid.appendChild(card);
    }
  }

  function rollRockRarity() {
    const z = state.floor - 1;
    const roll = Math.random();
    if (roll < 0.004 + z * 0.002) return RARITIES[10]; // Apex Purple
    if (roll < 0.011 + z * 0.004) return RARITIES[9];  // Glitched
    if (roll < 0.022 + z * 0.006) return RARITIES[8];  // Galactic
    if (roll < 0.040 + z * 0.009) return RARITIES[7];  // Divine
    if (roll < 0.068 + z * 0.012) return RARITIES[6];  // Secret
    if (roll < 0.110 + z * 0.016) return RARITIES[5];  // Exotic
    if (roll < 0.175 + z * 0.020) return RARITIES[4];  // Mythic
    if (roll < 0.270 + z * 0.022) return RARITIES[3];  // Epic
    if (roll < 0.430 + z * 0.020) return RARITIES[2];  // Rare
    if (roll < 0.700) return RARITIES[1];              // Uncommon
    return RARITIES[0];                                // Common
  }

  function generateFloor() {
    state.grid = [];
    state.trees = [];
    state.tracks = [];
    state.enemies = [];
    state.drops = [];
    state.particles = [];

    state.player.x = TILE * 2.5;
    state.player.y = TILE * 2.5;
    state.petPos.x = TILE * 2.0;
    state.petPos.y = TILE * 2.5;

    const gateR = ROWS - 3 - Math.floor(Math.random() * 3);
    const gateC = COLS - 3 - Math.floor(Math.random() * 4);

    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
          row.push({ type: "border" });
          if ((r + c) % 2 === 0) {
            state.trees.push({ x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 });
          }
          continue;
        }

        if (r <= 3 && c <= 5) {
          row.push({ type: "ground", variant: (r + c) % 3, isCamp: true });
          if (r === 3 && c >= 1 && c <= 5) {
            state.tracks.push({ r, c });
          }
          continue;
        }

        if (r === gateR && c === gateC) {
          const rar = RARITIES[2];
          const baseHp = 12 + state.floor * 4;
          row.push({
            type: "rock",
            rarity: rar,
            hp: Math.round(baseHp * rar.hpMult),
            maxHp: Math.round(baseHp * rar.hpMult),
            hasGate: true
          });
          continue;
        }

        const noise = Math.sin(r * 0.6) + Math.cos(c * 0.5);
        const isOpenPath = noise > 0.3 || Math.random() < 0.5;

        if (!isOpenPath) {
          const rar = rollRockRarity();
          const baseHp = 10 + state.floor * 4;
          const hp = Math.round(baseHp * rar.hpMult);
          row.push({
            type: "rock",
            rarity: rar,
            hp,
            maxHp: hp
          });
        } else {
          row.push({ type: "ground", variant: (r * 3 + c * 7) % 3 });

          if ((r > 4 || c > 6) && Math.random() < 0.05 + state.floor * 0.008) {
            const typeRoll = Math.random();
            const critter = typeRoll < 0.45
              ? { emoji: "🐺", name: "Quarry Wolf", hp: 16 + state.floor * 5, atk: 4 + state.floor * 2, speed: 1.65 }
              : typeRoll < 0.8
              ? { emoji: "🐗", name: "Wild Boar", hp: 24 + state.floor * 7, atk: 6 + state.floor * 2, speed: 1.2 }
              : { emoji: "🗿", name: "Stone Sentinel", hp: 40 + state.floor * 10, atk: 9 + state.floor * 3, speed: 0.8 };

            state.enemies.push({
              x: c * TILE + TILE / 2,
              y: r * TILE + TILE / 2,
              ...critter,
              maxHp: critter.hp,
              hitFlash: 0
            });
          }
        }
      }
      state.grid.push(row);
    }

    updateUI();
  }

  function updateUI() {
    const curPick = getActivePickaxe();
    const nextPick = PICKAXE_MATERIALS[state.pickTier + 1];
    const activePet = getActivePet();

    game.querySelector("#rpgLevel").textContent = state.level;
    game.querySelector("#rpgXp").textContent = state.xp;
    game.querySelector("#rpgNextXp").textContent = state.nextXp;
    game.querySelector("#hpText").textContent = `${Math.max(0, Math.ceil(state.hp))}/${state.maxHp}`;
    game.querySelector("#goldText").textContent = state.gold.toLocaleString();
    game.querySelector("#floorText").textContent = state.floor;

    game.querySelector("#invStone").textContent = state.stone;
    game.querySelector("#invIron").textContent = state.iron;
    game.querySelector("#invGems").textContent = state.gems;
    game.querySelector("#invEggs").textContent = state.eggs;
    game.querySelector("#statAtk").textContent = getTotalAtk();

    game.querySelector("#tabEggCount").textContent = state.eggs;
    game.querySelector("#hatchEggCount").textContent = state.eggs;
    game.querySelector("#btnEggCount").textContent = state.eggs;
    game.querySelector("#sideEggCount").textContent = state.eggs;

    const sidePet = game.querySelector("#sidePetLabel");
    const eqPetName = game.querySelector("#equippedPetName");
    if (activePet) {
      sidePet.textContent = activePet.name;
      sidePet.style.color = activePet.color;
      eqPetName.textContent = `${activePet.name} (${activePet.rarity})`;
      eqPetName.style.color = activePet.color;
    } else {
      sidePet.textContent = "None";
      sidePet.style.color = "#9ca3af";
      eqPetName.textContent = "None";
      eqPetName.style.color = "#9ca3af";
    }

    const pickLabel = game.querySelector("#equippedPickLabel");
    pickLabel.textContent = curPick.name;
    pickLabel.style.color = curPick.color;

    game.querySelector("#shopCurPick").textContent = curPick.name;
    game.querySelector("#shopCurPick").style.color = curPick.color;

    const upgPickBtn = game.querySelector("#upgPick");
    if (nextPick) {
      game.querySelector("#shopNextPick").textContent = `${nextPick.name} (+${nextPick.atkBonus} ATK)`;
      game.querySelector("#shopNextPick").style.color = nextPick.color;
      upgPickBtn.innerHTML = `FORGE (${nextPick.cost.toLocaleString()}G)`;
      upgPickBtn.disabled = state.gold < nextPick.cost;
    } else {
      game.querySelector("#shopNextPick").textContent = "MAX MATERIAL REACHED!";
      game.querySelector("#shopNextPick").style.color = "#a855f7";
      upgPickBtn.textContent = "MAXED OUT";
      upgPickBtn.disabled = true;
    }

    const sellVal = getSellValue();
    game.querySelector("#sellValuePreview").textContent = sellVal.toLocaleString();
    game.querySelector("#sideSellPreview").textContent = sellVal.toLocaleString();

    game.querySelector("#armorCost").textContent = state.armorCost;
    game.querySelector("#bootsCost").textContent = state.bootsCost;

    game.querySelector("#upgArmor").disabled = state.gold < state.armorCost;
    game.querySelector("#upgBoots").disabled = state.gold < state.bootsCost;
    game.querySelector("#healBtn").disabled = state.gold < 15 || state.hp >= state.maxHp;
    game.querySelector("#sellOresBtn").disabled = sellVal === 0;
    game.querySelector("#hudsonSellBtn").disabled = sellVal === 0;
    game.querySelector("#hatchEggBtn").disabled = state.eggs <= 0;
    game.querySelector("#sideHatchBtn").disabled = state.eggs <= 0;
    game.querySelector("#unequipPetBtn").disabled = !state.equippedPet;

    renderPetRoster();
  }

  function isTileBlocked(px, py) {
    const r = Math.floor(py / TILE);
    const c = Math.floor(px / TILE);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
    const cell = state.grid[r][c];
    return cell.type === "border" || cell.type === "rock";
  }

  function swingPickaxe() {
    if (!state.started || state.player.swingTimer > 0) return;
    state.player.swingTimer = 14;

    const totalAtk = getTotalAtk();
    const reach = 42;
    const hitX = state.player.x + state.player.dirX * reach;
    const hitY = state.player.y + state.player.dirY * reach;

    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      if (Math.hypot(e.x - hitX, e.y - hitY) < 44) {
        e.hp -= totalAtk;
        e.hitFlash = 8;
        e.x += state.player.dirX * 16;
        e.y += state.player.dirY * 16;
        spawnRockParticles(e.x, e.y, "#ef4444");
        addFloatingText(e.x, e.y - 16, `-${totalAtk}`, "#f87171");

        if (e.hp <= 0) {
          addLog(`${getActiveChar().name} defeated ${e.name}! (+${10 + state.floor * 3} XP)`);
          gainXp(10 + state.floor * 3);
          state.drops.push({ x: e.x, y: e.y, type: "gold", amount: 7 + state.floor * 2, emoji: "💰" });
          if (Math.random() < 0.35) {
            state.drops.push({ x: e.x + 10, y: e.y, type: "potion", amount: 30, emoji: "🧪" });
          }
          state.enemies.splice(i, 1);
          saveProgress();
        }
      }
    }

    const r = Math.floor(hitY / TILE);
    const c = Math.floor(hitX / TILE);
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      const cell = state.grid[r][c];
      if (cell.type === "rock") {
        cell.hp -= totalAtk;
        const cx = c * TILE + TILE / 2;
        const cy = r * TILE + TILE / 2;
        spawnRockParticles(cx, cy, cell.rarity.color);
        addFloatingText(cx, cy - 12, `-${totalAtk}`, cell.rarity.color);

        if (cell.hp <= 0) {
          const mult = getTotalLootMult();
          gainXp(cell.rarity.xp + state.floor);

          if (cell.hasGate) {
            state.grid[r][c] = { type: "gate" };
            addLog("🪜 Zone Gate uncovered! Step on it to advance.");
            addFloatingText(cx, cy, "NEXT ZONE GATE!", "#4ade80");
          } else {
            state.grid[r][c] = { type: "ground", variant: (r + c) % 3 };
            const qty = Math.ceil(cell.rarity.dropCount * mult);
            state.drops.push({
              x: cx - (cell.rarity.goldBonus > 0 ? 7 : 0),
              y: cy,
              type: cell.rarity.dropType,
              amount: qty,
              emoji: cell.rarity.dropEmoji
            });

            if (cell.rarity.goldBonus > 0) {
              state.drops.push({
                x: cx + 7,
                y: cy,
                type: "gold",
                amount: Math.round(cell.rarity.goldBonus * state.floor * mult),
                emoji: "💰"
              });
            }

            // Chance to drop a Quarry Egg from smashed boulders
            if (Math.random() < cell.rarity.eggChance) {
              state.drops.push({
                x: cx,
                y: cy - 8,
                type: "egg",
                amount: 1,
                emoji: "🥚"
              });
              addLog(`🥚 A Quarry Egg popped out of the ${cell.rarity.label} rock!`);
            }

            if (cell.rarity.xp >= 24) {
              addLog(`★ Shattered a [${cell.rarity.label.toUpperCase()}] boulder!`);
            }
          }
          saveProgress();
        }
      }
    }
    updateUI();
  }

  function update() {
    if (!state.started) return;

    const p = state.player;
    if (p.swingTimer > 0) p.swingTimer--;
    if (p.invuln > 0) p.invuln--;

    let dx = 0;
    let dy = 0;
    if (state.keys["w"] || state.keys["ArrowUp"] || state.touchDirs.up) dy -= 1;
    if (state.keys["s"] || state.keys["ArrowDown"] || state.touchDirs.down) dy += 1;
    if (state.keys["a"] || state.keys["ArrowLeft"] || state.touchDirs.left) dx -= 1;
    if (state.keys["d"] || state.keys["ArrowRight"] || state.touchDirs.right) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      p.dirX = dx;
      p.dirY = dy;

      const spd = getTotalSpeed();
      const rad = 14;

      const nx = p.x + dx * spd;
      if (!isTileBlocked(nx - rad, p.y - rad) &&
          !isTileBlocked(nx + rad, p.y - rad) &&
          !isTileBlocked(nx - rad, p.y + rad) &&
          !isTileBlocked(nx + rad, p.y + rad)) {
        p.x = nx;
      }

      const ny = p.y + dy * spd;
      if (!isTileBlocked(p.x - rad, ny - rad) &&
          !isTileBlocked(p.x + rad, ny - rad) &&
          !isTileBlocked(p.x - rad, ny + rad) &&
          !isTileBlocked(p.x + rad, ny + rad)) {
        p.y = ny;
      }
    }

    // Smooth pet companion follow
    const targetPetX = p.x - p.dirX * 28;
    const targetPetY = p.y - p.dirY * 28 + 6;
    state.petPos.x += (targetPetX - state.petPos.x) * 0.12;
    state.petPos.y += (targetPetY - state.petPos.y) * 0.12;

    const lookR = Math.floor((p.y + p.dirY * 42) / TILE);
    const lookC = Math.floor((p.x + p.dirX * 42) / TILE);
    const targetInfo = game.querySelector("#targetRockInfo");
    if (state.grid[lookR] && state.grid[lookR][lookC] && state.grid[lookR][lookC].type === "rock") {
      const rk = state.grid[lookR][lookC];
      targetInfo.innerHTML = `<span style="color:${rk.rarity.color}; font-weight:900;">[${rk.rarity.label.toUpperCase()}]</span> (${rk.hp}/${rk.maxHp} HP)`;
    } else {
      targetInfo.textContent = "Walk near a rock";
    }

    const pr = Math.floor(p.y / TILE);
    const pc = Math.floor(p.x / TILE);
    if (state.grid[pr] && state.grid[pr][pc] && state.grid[pr][pc].type === "gate") {
      state.floor += 1;
      addLog(`⛰️ Entered Zone ${state.floor}! Higher Galactic & Apex odds!`);
      saveProgress();
      generateFloor();
      return;
    }

    for (let i = state.drops.length - 1; i >= 0; i--) {
      const d = state.drops[i];
      if (Math.hypot(p.x - d.x, p.y - d.y) < 30) {
        if (d.type === "gold") state.gold += d.amount;
        if (d.type === "stone") state.stone += d.amount;
        if (d.type === "iron") state.iron += d.amount;
        if (d.type === "gem") state.gems += d.amount;
        if (d.type === "egg") {
          state.eggs += d.amount;
          addFloatingText(p.x, p.y - 22, "+1 QUARRY EGG!", "#fde68a");
        }
        if (d.type === "potion") {
          state.hp = Math.min(state.maxHp, state.hp + d.amount);
          addFloatingText(p.x, p.y - 18, `+${d.amount} HP`, "#4ade80");
        }
        state.drops.splice(i, 1);
        saveProgress();
        updateUI();
      }
    }

    for (const e of state.enemies) {
      if (e.hitFlash > 0) e.hitFlash--;
      const dist = Math.hypot(p.x - e.x, p.y - e.y);
      if (dist < 220 && dist > 18) {
        const vx = ((p.x - e.x) / dist) * e.speed;
        const vy = ((p.y - e.y) / dist) * e.speed;
        if (!isTileBlocked(e.x + vx, e.y)) e.x += vx;
        if (!isTileBlocked(e.x, e.y + vy)) e.y += vy;
      }
      if (dist < 26 && p.invuln === 0) {
        state.hp -= e.atk;
        p.invuln = 45;
        addFloatingText(p.x, p.y - 20, `-${e.atk} HP`, "#ef4444");
        if (state.hp <= 0) {
          addLog(`💀 ${getActiveChar().name} fainted! Returned to Zone 1 Camp.`);
          state.floor = 1;
          state.hp = state.maxHp;
          saveProgress();
          generateFloor();
          return;
        }
        updateUI();
      }
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }

    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      state.floatingTexts[i].y -= 0.75;
      state.floatingTexts[i].life--;
      if (state.floatingTexts[i].life <= 0) state.floatingTexts.splice(i, 1);
    }
  }

  // Draw Custom Pixel-Art Quarry Pet Companion
  function drawEquippedPet(pet, px, py) {
    const bob = Math.round(Math.sin(Date.now() * 0.008) * 2);
    const x = Math.round(px);
    const y = Math.round(py) + bob;

    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(-9, 8 - bob, 18, 4);

    if (pet.id === "potato_rock") {
      // Potato Rock: bumpy potato-shaped rock
      ctx.fillStyle = "#78350f";
      ctx.fillRect(-9, -6, 18, 12);
      ctx.fillRect(-7, -8, 14, 16);
      ctx.fillStyle = "#b45309";
      ctx.fillRect(-7, -6, 14, 10);
      ctx.fillStyle = "#d97706";
      ctx.fillRect(-5, -5, 10, 5);
      // Potato eyes & face
      ctx.fillStyle = "#451a03";
      ctx.fillRect(-5, -3, 2, 2);
      ctx.fillRect(4, 1, 2, 2);
      ctx.fillStyle = "#090d0a";
      ctx.fillRect(-3, -1, 2, 2);
      ctx.fillRect(2, -1, 2, 2);
    } else if (pet.id === "chungo") {
      // Chungo: Diglett-shaped piece of pink/white quartz
      ctx.fillStyle = "#9d174d";
      ctx.fillRect(-7, -10, 14, 18);
      ctx.fillRect(-5, -12, 10, 2);
      ctx.fillStyle = "#f472b6";
      ctx.fillRect(-5, -10, 10, 16);
      ctx.fillStyle = "#fbcfe8";
      ctx.fillRect(-3, -9, 5, 10);
      // Quartz base pebbles
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(-9, 5, 18, 4);
      // Diglett eyes & pink nose
      ctx.fillStyle = "#090d0a";
      ctx.fillRect(-3, -5, 2, 3);
      ctx.fillRect(2, -5, 2, 3);
      ctx.fillStyle = "#fb7185";
      ctx.fillRect(-2, -1, 5, 3);
    } else if (pet.id === "slab") {
      // Slab: flat sturdy slab of rock
      ctx.fillStyle = "#334155";
      ctx.fillRect(-12, -4, 24, 10);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(-10, -3, 20, 7);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(-9, -3, 18, 3);
      // Eyes
      ctx.fillStyle = "#090d0a";
      ctx.fillRect(-4, 0, 2, 2);
      ctx.fillRect(3, 0, 2, 2);
    } else if (pet.id === "grail") {
      // Grail: hovering mini meteor with fiery tail
      ctx.fillStyle = "#f97316";
      ctx.fillRect(-12, -8, 6, 4);
      ctx.fillRect(-10, -2, 5, 4);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(-9, -6, 4, 4);
      ctx.fillStyle = "#581c87";
      ctx.fillRect(-6, -7, 14, 14);
      ctx.fillRect(-4, -9, 10, 18);
      ctx.fillStyle = "#9333ea";
      ctx.fillRect(-4, -6, 10, 11);
      ctx.fillStyle = "#e879f9";
      ctx.fillRect(-2, -4, 5, 5);
      // Glowing eyes
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(-1, -1, 2, 2);
      ctx.fillRect(4, -1, 2, 2);
    }

    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.fillStyle = pet.color;
    ctx.textAlign = "center";
    ctx.fillText(pet.name.toUpperCase(), 0, -16);

    ctx.restore();
  }

  // Render Pixel-Art Surface Quarry
  function render() {
    if (!state.started) return;

    const worldW = COLS * TILE;
    const worldH = ROWS * TILE;

    const camX = Math.round(Math.max(0, Math.min(worldW - canvas.width, state.player.x - canvas.width / 2)));
    const camY = Math.round(Math.max(0, Math.min(worldH - canvas.height, state.player.y - canvas.height / 2)));

    ctx.fillStyle = "#244224";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camX, -camY);

    const earthShades = ["#8c6d46", "#80623d", "#96764d"];
    const tick = Math.floor(Date.now() / 120);

    // 1. Pixel Ground, Grass Perimeter, and Stepped Pixel Boulders
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = state.grid[r][c];
        const x = c * TILE;
        const y = r * TILE;

        if (cell.type === "border") {
          ctx.fillStyle = (r + c) % 2 === 0 ? "#2e5c2d" : "#254c24";
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = "#4ade80";
          ctx.fillRect(x + 8, y + 10, 4, 8);
          ctx.fillRect(x + 12, y + 14, 4, 4);
          ctx.fillRect(x + 30, y + 28, 4, 8);
          continue;
        }

        ctx.fillStyle = cell.isCamp ? "#a6865b" : earthShades[cell.variant || 0];
        ctx.fillRect(x, y, TILE, TILE);

        ctx.fillStyle = "rgba(0,0,0,0.14)";
        ctx.fillRect(x + ((r * 12) % 32) + 4, y + ((c * 16) % 32) + 4, 4, 4);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(x + ((c * 12) % 32) + 8, y + ((r * 16) % 32) + 8, 4, 4);

        if (cell.type === "rock") {
          const rar = cell.rarity;
          let outlineColor = rar.color;
          let bodyColor = rar.rockFill;
          let topColor = rar.rockTop;

          if (rar.id === "glitched") {
            const glitchColors = ["#22d3ee", "#f43f5e", "#a3e635", "#facc15"];
            outlineColor = glitchColors[(tick + r + c) % glitchColors.length];
            const jitterX = ((tick + r) % 3) - 1;
            ctx.fillStyle = "#f43f5e";
            ctx.fillRect(x + 6 + jitterX, y + 8, TILE - 12, TILE - 12);
          } else if (rar.id === "galactic") {
            outlineColor = tick % 2 === 0 ? "#818cf8" : "#e879f9";
          } else if (rar.id === "apex_purple") {
            outlineColor = tick % 2 === 0 ? "#a855f7" : "#e879f9";
          }

          if (rar.id !== "common") {
            ctx.fillStyle = outlineColor;
            ctx.fillRect(x + 4, y + 8, TILE - 8, TILE - 12);
            ctx.fillRect(x + 8, y + 4, TILE - 16, TILE - 4);
          }

          ctx.fillStyle = bodyColor;
          ctx.fillRect(x + 6, y + 10, TILE - 12, TILE - 16);
          ctx.fillRect(x + 10, y + 6, TILE - 20, TILE - 8);

          ctx.fillStyle = topColor;
          ctx.fillRect(x + 12, y + 8, TILE - 24, 6);
          ctx.fillRect(x + 8, y + 12, 8, 6);

          ctx.fillStyle = rar.fleck;
          ctx.fillRect(x + 14, y + 20, 6, 6);
          ctx.fillRect(x + 28, y + 24, 6, 6);
          ctx.fillRect(x + 20, y + 32, 4, 4);

          if (cell.hp < cell.maxHp) {
            ctx.fillStyle = "#090d0a";
            ctx.fillRect(x + 6, y + TILE - 9, TILE - 12, 6);
            ctx.fillStyle = outlineColor;
            ctx.fillRect(x + 8, y + TILE - 7, Math.max(2, Math.floor((TILE - 16) * (cell.hp / cell.maxHp))), 2);
          }
        } else if (cell.type === "gate") {
          ctx.fillStyle = "#14532d";
          ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
          ctx.strokeStyle = "#4ade80";
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 6, y + 6, TILE - 12, TILE - 12);
          ctx.fillStyle = "#ffffff";
          ctx.font = EMOJI_FONT(24);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🪜", x + TILE / 2, y + TILE / 2);
        }
      }
    }

    // 2. Pixel Minecart Tracks at Camp
    for (const tr of state.tracks) {
      const tx = tr.c * TILE;
      const ty = tr.r * TILE;
      ctx.fillStyle = "#451a03";
      for (let sx = tx + 4; sx < tx + TILE; sx += 12) {
        ctx.fillRect(sx, ty + 14, 6, 20);
      }
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(tx, ty + 16, TILE, 3);
      ctx.fillRect(tx, ty + 29, TILE, 3);
    }

    // 3. Perimeter Trees (Full Color)
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = EMOJI_FONT(34);
    for (const tree of state.trees) {
      ctx.fillText("🌲", tree.x, tree.y);
    }

    // 4. Camp NPCs (Hudson & Prospector Phil)
    ctx.fillStyle = "#ffffff";
    ctx.font = EMOJI_FONT(28);
    ctx.fillText("🧑‍💼", TILE * 4.5, TILE * 1.5);
    ctx.fillText("🕵️‍♂️", TILE * 5.5, TILE * 2.2);
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.fillStyle = "#fef08a";
    ctx.fillText("HUDSON", TILE * 4.5, TILE * 1.5 - 20);
    ctx.fillText("PROSPECTOR PHIL", TILE * 5.5, TILE * 2.2 - 20);

    // 5. Loot Drops (Full Color)
    ctx.fillStyle = "#ffffff";
    ctx.font = EMOJI_FONT(22);
    for (const d of state.drops) {
      const bob = Math.round(Math.sin(Date.now() * 0.008 + d.x) * 3);
      ctx.fillText(d.emoji, Math.round(d.x), Math.round(d.y) + bob);
    }

    // 6. Wildlife (Full Color)
    for (const e of state.enemies) {
      ctx.fillStyle = "#ffffff";
      ctx.font = EMOJI_FONT(28);
      ctx.fillText(e.emoji, Math.round(e.x), Math.round(e.y));
      ctx.fillStyle = "#090d0a";
      ctx.fillRect(Math.round(e.x) - 16, Math.round(e.y) - 22, 32, 5);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(Math.round(e.x) - 15, Math.round(e.y) - 21, Math.round(30 * (e.hp / e.maxHp)), 3);
    }

    // 7. Equipped Quarry Pet Companion
    const activePet = getActivePet();
    if (activePet) {
      drawEquippedPet(activePet, state.petPos.x, state.petPos.y);
    }

    // 8. Player (Neil 🧒🏽, Xavier, or Carter) + Material-Colored Pixel Pickaxe
    const p = state.player;
    const ch = getActiveChar();
    const pick = getActivePickaxe();
    ctx.save();
    ctx.translate(Math.round(p.x), Math.round(p.y));

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(-12, 11, 24, 6);

    if (p.invuln > 0 && Math.floor(p.invuln / 4) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = EMOJI_FONT(30);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ch.avatar, 0, 0);
    ctx.globalAlpha = 1;

    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(ch.name.toUpperCase(), 0, -22);

    const baseAngle = Math.atan2(p.dirY, p.dirX);
    const swingOffset = p.swingTimer > 0 ? Math.sin((p.swingTimer / 14) * Math.PI) * 1.5 - 0.75 : 0;
    ctx.rotate(baseAngle + swingOffset);

    // Wooden handle
    ctx.fillStyle = "#92400e";
    ctx.fillRect(10, -2, 16, 4);
    // Material pickaxe head
    ctx.fillStyle = pick.color;
    ctx.fillRect(22, -10, 5, 20);
    ctx.fillRect(20, -8, 4, 4);
    ctx.fillRect(20, 4, 4, 4);

    ctx.restore();

    // 9. Square Pixel Particles & Floating Text
    for (const pt of state.particles) {
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
    }

    ctx.font = "bold 13px 'Courier New', monospace";
    for (const ft of state.floatingTexts) {
      ctx.fillStyle = "#000000";
      ctx.fillText(ft.text, Math.round(ft.x) + 1, Math.round(ft.y) + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
    }

    ctx.restore();
  }

  let animId;
  function loop() {
    if (!document.getElementById("rock-chopper-game")) return;
    update();
    render();
    animId = requestAnimationFrame(loop);
  }

  // Toolbar Tab Switching
  function switchTab(tabId) {
    game.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tabId);
    });
    game.querySelectorAll(".tab-panel").forEach((p) => {
      p.classList.toggle("active", p.id === tabId);
    });
    if (tabId === "quarryTab") {
      resizeCanvas();
    } else if (tabId === "leaderboardTab") {
      renderLeaderboardTable();
    }
  }

  game.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Toggle Touch Controls Button
  game.querySelector("#toggleTouchBtn").addEventListener("click", (e) => {
    state.touchVisible = !state.touchVisible;
    game.querySelector("#touchControls").classList.toggle("hidden", !state.touchVisible);
    e.currentTarget.innerHTML = `<span class="emoji-color">📱</span> Touch: ${state.touchVisible ? "ON" : "OFF"}`;
    saveProgress();
  });

  // Touch D-Pad & Chop Listeners
  game.querySelectorAll(".dpad-btn").forEach((btn) => {
    const dir = btn.dataset.dir;
    const press = (e) => {
      e.preventDefault();
      state.touchDirs[dir] = true;
      btn.classList.add("pressed");
    };
    const release = (e) => {
      e.preventDefault();
      state.touchDirs[dir] = false;
      btn.classList.remove("pressed");
    };
    btn.addEventListener("touchstart", press, { passive: false });
    btn.addEventListener("touchend", release, { passive: false });
    btn.addEventListener("touchcancel", release, { passive: false });
    btn.addEventListener("mousedown", press);
    btn.addEventListener("mouseup", release);
    btn.addEventListener("mouseleave", release);
  });

  const touchChopBtn = game.querySelector("#touchChopBtn");
  const triggerTouchChop = (e) => {
    e.preventDefault();
    swingPickaxe();
  };
  touchChopBtn.addEventListener("touchstart", triggerTouchChop, { passive: false });
  touchChopBtn.addEventListener("mousedown", triggerTouchChop);

  // Prospector Phil Dialogue Topics (including Quarry Pets!)
  const philTips = {
    pets: "\"Smashing rocks can drop Quarry Eggs! Hatch them in the Pets tab to unlock 4 companions: Potato Rock (+15% Gold & Ores), Chungo the quartz Diglett (+Speed), Slab (+6 ATK & +35 HP), and Grail the mini meteor (+15 ATK & +25% Gold)!\"",
    rarities: "\"There are 11 rock tiers out here: Common, Uncommon, Rare, Epic, Mythic, Exotic, Secret, Divine, Galactic, Glitched, and Apex Purple! Higher-tier rocks also have a much higher chance to drop Quarry Eggs!\"",
    materials: "\"Visit Hudson's Shop to upgrade your pickaxe material from Wood → Stone → Copper → Iron → Gold → Diamond → Obsidian → Mythril → Voidsteel → Celestial → Apex Purple Pickaxe!\"",
    zones: "\"Every quarry zone conceals a wooden ladder under one rock. Advance to deeper zones to boost your odds of uncovering Galactic, Glitched, and Apex Purple boulders!\"",
    crew: "\"All-Rounder Neil gets +30% Gold and ores, Xavier swings with extra power and HP to crack high-tier rocks fast, and Carter sprints across the quarry at top speed!\"",
    random: [
      "\"Prospector Note #104: Higher-rarity rocks like Mythic, Galactic, and Apex Purple almost always drop a Quarry Egg when shattered!\"",
      "\"Prospector Note #209: Pair All-Rounder Neil (+30% loot) with Potato Rock (+15% loot) or Grail (+25% loot) for massive gold payouts at Hudson's Shop!\"",
      "\"Prospector Note #312: Your progress, hatched pets, and upgrades save automatically in your browser whenever you collect loot or upgrade gear!\""
    ]
  };

  game.querySelectorAll(".topic-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const topic = btn.dataset.topic;
      const speech = game.querySelector("#philSpeech");
      if (topic === "random") {
        const list = philTips.random;
        speech.textContent = list[Math.floor(Math.random() * list.length)];
      } else {
        speech.textContent = philTips[topic];
      }
    });
  });

  // Title Screen Character Selection
  game.querySelectorAll(".char-card").forEach((card) => {
    card.addEventListener("click", () => {
      game.querySelectorAll(".char-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      state.selectedChar = card.dataset.char;
      saveProgress();
    });
  });

  game.querySelector("#startGameBtn").addEventListener("click", () => {
    game.querySelector("#titleScreen").classList.add("hidden");
    state.started = true;
    resizeCanvas();
    applyCharacterStats(false);
    if (state.grid.length === 0) {
      generateFloor();
    }
    saveProgress();
    addLog(`${getActiveChar().name} entered Smashcenter Zone ${state.floor}!`);
  });

  game.querySelector("#switchCharBtn").addEventListener("click", () => {
    state.started = false;
    game.querySelector("#titleScreen").classList.remove("hidden");
  });

  // Keyboard & Canvas Click Controls
  const onKeyDown = (e) => {
    if (!document.getElementById("rock-chopper-game") || !state.started) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }
    state.keys[e.key] = true;
    if (e.key === " ") swingPickaxe();
  };

  const onKeyUp = (e) => {
    state.keys[e.key] = false;
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  canvas.addEventListener("mousedown", (e) => {
    if (!state.started) return;
    const rect = canvas.getBoundingClientRect();
    const worldW = COLS * TILE;
    const worldH = ROWS * TILE;
    const camX = Math.max(0, Math.min(worldW - canvas.width, state.player.x - canvas.width / 2));
    const camY = Math.max(0, Math.min(worldH - canvas.height, state.player.y - canvas.height / 2));

    const clickX = (e.clientX - rect.left) + camX;
    const clickY = (e.clientY - rect.top) + camY;
    const angle = Math.atan2(clickY - state.player.y, clickX - state.player.x);
    state.player.dirX = Math.cos(angle);
    state.player.dirY = Math.sin(angle);
    swingPickaxe();
  });

  // Hudson Shop, Hatchery & Save Actions
  function sellAllOres() {
    const earned = getSellValue();
    if (earned <= 0) return;
    state.gold += earned;
    state.stone = 0;
    state.iron = 0;
    state.gems = 0;
    game.querySelector("#hudsonSpeech").textContent = `"Pleasure doing business! Here's ${earned.toLocaleString()} gold. Ready to forge a stronger pickaxe material?"`;
    addLog(`Sold ores to Hudson for +${earned.toLocaleString()}G!`);
    saveProgress();
    updateUI();
  }

  game.querySelector("#sellOresBtn").addEventListener("click", sellAllOres);
  game.querySelector("#hudsonSellBtn").addEventListener("click", sellAllOres);

  game.querySelector("#hatchEggBtn").addEventListener("click", hatchEgg);
  game.querySelector("#sideHatchBtn").addEventListener("click", hatchEgg);
  game.querySelector("#unequipPetBtn").addEventListener("click", () => {
    equipPet(null);
    addLog("🐾 Unequipped pet companion.");
  });

  game.querySelector("#manualSaveBtn").addEventListener("click", () => saveProgress(true));
  game.querySelector("#resetSaveBtn").addEventListener("click", resetProgress);

  game.querySelector("#upgPick").addEventListener("click", () => {
    const nextPick = PICKAXE_MATERIALS[state.pickTier + 1];
    if (!nextPick || state.gold < nextPick.cost) return;
    state.gold -= nextPick.cost;
    state.pickTier += 1;
    game.querySelector("#hudsonSpeech").textContent = `"Fresh off the anvil! Your new ${nextPick.name} will tear right through rare formations!"`;
    addLog(`Forged ${nextPick.name}! Total ATK: ${getTotalAtk()}.`);
    saveProgress();
    updateUI();
  });

  game.querySelector("#upgArmor").addEventListener("click", () => {
    if (state.gold < state.armorCost) return;
    state.gold -= state.armorCost;
    state.bonusHp += 25;
    state.maxHp = getTotalMaxHp();
    state.hp += 25;
    state.armorCost = Math.round(state.armorCost * 1.5);
    game.querySelector("#hudsonSpeech").textContent = `"Strapped and fitted! Max HP boosted to ${state.maxHp}."`;
    addLog(`Bought Reinforced Vest! Max HP: ${state.maxHp}.`);
    saveProgress();
    updateUI();
  });

  game.querySelector("#upgBoots").addEventListener("click", () => {
    if (state.gold < state.bootsCost) return;
    state.gold -= state.bootsCost;
    state.bonusSpeed += 0.45;
    state.bootsCost = Math.round(state.bootsCost * 1.55);
    game.querySelector("#hudsonSpeech").textContent = `"Light as a feather! You'll sprint across the quarry."`;
    addLog("Upgraded Trail Runner Boots!");
    saveProgress();
    updateUI();
  });

  game.querySelector("#healBtn").addEventListener("click", () => {
    if (state.gold < 15 || state.hp >= state.maxHp) return;
    state.gold -= 15;
    state.hp = Math.min(state.maxHp, state.hp + 60);
    game.querySelector("#hudsonSpeech").textContent = `"Bottoms up! Patching you right back to full strength."`;
    addLog("Drank Hudson's Med-Tonic (+60 HP).");
    saveProgress();
    updateUI();
  });

  game.querySelector("#newFloorBtn").addEventListener("click", () => {
    addLog(`Refreshed surface quarry for Zone ${state.floor}.`);
    generateFloor();
  });

  // =========================================================
  // SERVERLESS ONLINE ACCOUNTS & LEADERBOARD (GUN.JS)
  // =========================================================
  const gun = window.Gun
    ? window.Gun({
        peers: [
          "https://gun.eco/gun",
          "https://relay.peer.ooo/gun",
          "https://gundb-relay-mlom.onrender.com/gun"
        ],
        localStorage: true
      })
    : null;

  const user = gun ? gun.user().recall({ sessionStorage: true }) : null;
  const lbNode = gun ? gun.get("rockchopper_smashcenter_lb_v2") : null;

  const lbEntries = {};
  let loggedInAlias = "";

  function renderLeaderboardTable() {
    const tbody = game.querySelector("#leaderboardBody");
    if (!tbody) return;

    const list = Object.values(lbEntries)
      .filter((row) => row && row.username)
      .sort((a, b) => (b.zone - a.zone) || (b.level - a.level) || (b.gold - a.gold))
      .slice(0, 25);

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding:10px; color:#9ca3af;">No scores posted yet. Create a Miner Account above to claim #1!</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((row, idx) => {
      const isMe = loggedInAlias && row.username === loggedInAlias;
      const rankColor = idx === 0 ? "#fbbf24" : idx === 1 ? "#e2e8f0" : idx === 2 ? "#d97706" : "#9ca3af";
      return `
        <tr style="border-bottom:1px solid #2b3a30; background:${isMe ? "rgba(217, 119, 6, 0.2)" : "transparent"};">
          <td style="padding:8px; font-weight:900; color:${rankColor};">#${idx + 1}</td>
          <td style="padding:8px; font-weight:900; color:${isMe ? "#fde68a" : "#ffffff"};">${row.username}${isMe ? " (YOU)" : ""}</td>
          <td style="padding:8px; color:#cbd5e1;">${row.miner || "Neil"}</td>
          <td style="padding:8px; font-weight:900; color:#4ade80;">Zone ${row.zone || 1}</td>
          <td style="padding:8px; color:#38bdf8;">LV.${row.level || 1}</td>
          <td style="padding:8px; font-weight:900; color:#fbbf24;">${Number(row.gold || 0).toLocaleString()}G</td>
        </tr>
      `;
    }).join("");
  }

  function postScoreToNetwork() {
    if (!user || !user.is || !loggedInAlias || !lbNode) return;
    const record = {
      username: loggedInAlias,
      miner: getActiveChar().name,
      zone: state.floor,
      level: state.level,
      gold: state.gold,
      updatedAt: Date.now()
    };
    lbEntries[loggedInAlias] = record;
    lbNode.get(loggedInAlias).put(record);
    renderLeaderboardTable();
  }

  function updateAuthBanner() {
    const formWrap = game.querySelector("#authFormWrap");
    const loggedInWrap = game.querySelector("#loggedInWrap");
    const statusMsg = game.querySelector("#authStatusMsg");

    if (user && user.is && loggedInAlias) {
      formWrap.style.display = "none";
      loggedInWrap.style.display = "flex";
      statusMsg.innerHTML = `Signed in as <b style="color:#4ade80;">${loggedInAlias}</b> — Scores auto-sync to the Smashcenter Leaderboard!`;
      postScoreToNetwork();
    } else {
      formWrap.style.display = "flex";
      loggedInWrap.style.display = "none";
      statusMsg.textContent = "Create a Miner Account or log in to post your Zone, Level & Gold online!";
    }
  }

  if (lbNode) {
    lbNode.map().on((data, key) => {
      if (data && data.username) {
        lbEntries[key] = data;
        renderLeaderboardTable();
      }
    });
    // Ensure the "Connecting..." message clears even if the room is empty
    setTimeout(renderLeaderboardTable, 2500);
  } else {
    const tbody = game.querySelector("#leaderboardBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding:10px; color:#f87171;">Gun.js failed to load. Check your connection and refresh.</td></tr>`;
    }
  }

  if (gun) {
    gun.on("auth", () => {
      user.get("alias").once((alias) => {
        loggedInAlias = alias || game.querySelector("#authUsername").value.trim();
        updateAuthBanner();
      });
    });
  }

  game.querySelector("#signUpBtn").addEventListener("click", () => {
    if (!user) return;
    const username = game.querySelector("#authUsername").value.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    const password = game.querySelector("#authPassword").value;
    if (username.length < 3 || password.length < 8) {
      game.querySelector("#authStatusMsg").textContent = "Username needs 3+ letters/numbers and Password needs 8+ characters.";
      return;
    }
    game.querySelector("#authStatusMsg").textContent = "Creating Miner Account...";
    user.create(username, password, (ack) => {
      if (ack.err) {
        game.querySelector("#authStatusMsg").textContent = "Account error: " + ack.err;
        return;
      }
      user.auth(username, password, (loginAck) => {
        if (!loginAck.err) {
          loggedInAlias = username;
          addLog(`🏆 Created Miner Account: ${username}!`);
          updateAuthBanner();
        }
      });
    });
  });

  game.querySelector("#signInBtn").addEventListener("click", () => {
    if (!user) return;
    const username = game.querySelector("#authUsername").value.trim();
    const password = game.querySelector("#authPassword").value;
    if (!username || !password) return;
    game.querySelector("#authStatusMsg").textContent = "Logging in...";
    user.auth(username, password, (ack) => {
      if (ack.err) {
        game.querySelector("#authStatusMsg").textContent = "Login failed: " + ack.err;
        return;
      }
      loggedInAlias = username;
      addLog(`🏆 Logged in as ${username}!`);
      updateAuthBanner();
    });
  });

  game.querySelector("#signOutBtn").addEventListener("click", () => {
    if (!user) return;
    user.leave();
    loggedInAlias = "";
    updateAuthBanner();
    renderLeaderboardTable();
    addLog("Logged out of Miner Account.");
  });

  game.querySelector("#syncScoreBtn").addEventListener("click", () => {
    postScoreToNetwork();
    addLog("📡 Posted score to Smashcenter Leaderboard!");
  });

  // Auto-sync to P2P leaderboard whenever saveProgress() runs
  let lastNetSync = 0;
  const origSaveProgress = saveProgress;
  saveProgress = function (showNotice = false) {
    origSaveProgress(showNotice);
    const now = Date.now();
    if (user && user.is && loggedInAlias && now - lastNetSync > 8000) {
      lastNetSync = now;
      postScoreToNetwork();
    }
  };

  // Load saved progress on startup
  const loaded = loadProgress();
  updateUI();
  if (loaded) {
    addLog(`💾 Loaded saved game (Zone ${state.floor}, LV.${state.level}, ${state.gold}G).`);
  }

  loop();
})();