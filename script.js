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

  // Daily Challenges Pool (4 chosen per UTC day; beating each grants instant XP!)
  const DAILY_CHALLENGE_POOL = [
    {
      id: "smash_15",
      title: "Boulder Breaker",
      emoji: "⛏️",
      color: "#fbbf24",
      type: "rocks",
      target: 15,
      xp: 45,
      desc: "Smash 15 surface boulders in the quarry."
    },
    {
      id: "smash_35",
      title: "Quarry Demolition",
      emoji: "💥",
      color: "#f97316",
      type: "rocks",
      target: 35,
      xp: 95,
      desc: "Shatter 35 surface boulders in the quarry."
    },
    {
      id: "rare_4",
      title: "Rare Vein Hunter",
      emoji: "💎",
      color: "#38bdf8",
      type: "rare_rocks",
      target: 4,
      xp: 80,
      desc: "Smash 4 Rare (blue) or higher-tier boulders."
    },
    {
      id: "enemies_4",
      title: "Quarry Patrol",
      emoji: "🐺",
      color: "#f87171",
      type: "enemies",
      target: 4,
      xp: 65,
      desc: "Defeat 4 wild quarry critters."
    },
    {
      id: "gold_150",
      title: "Gold Prospector",
      emoji: "💰",
      color: "#facc15",
      type: "gold_earned",
      target: 150,
      xp: 75,
      desc: "Collect or sell ores for 150 Gold."
    },
    {
      id: "zones_2",
      title: "Deep Expedition",
      emoji: "🪜",
      color: "#4ade80",
      type: "zones",
      target: 2,
      xp: 90,
      desc: "Step through Zone Gates to advance 2 Zones."
    },
    {
      id: "eggs_2",
      title: "Nest Finder",
      emoji: "🥚",
      color: "#fde68a",
      type: "eggs",
      target: 2,
      xp: 85,
      desc: "Collect 2 Quarry Eggs from broken boulders."
    },
    {
      id: "parkour_1",
      title: "Sky-Bridge Sprinter",
      emoji: "🏃",
      color: "#a3e635",
      type: "parkour",
      target: 1,
      xp: 120,
      desc: "Beat the Smashcenter Parkour Course 1 time."
    },
    {
      id: "boss_1",
      title: "Titan Challenger",
      emoji: "👹",
      color: "#c084fc",
      type: "bosses",
      target: 1,
      xp: 150,
      desc: "Defeat 1 Quarry Boss."
    }
  ];

  // Quarry Bosses Catalog (Spawn every 3 Zones or via Summon Boss)
  const BOSS_CATALOG = [
    {
      id: "granite_gorgon",
      name: "GORGON THE GRANITE GOLEM",
      emoji: "👹",
      color: "#f97316",
      baseHp: 140,
      baseAtk: 10,
      speed: 1.15,
      xp: 85,
      gold: 95,
      gems: 6,
      relicId: "granite_heart"
    },
    {
      id: "magma_ignis",
      name: "MAGMA WYRM IGNIS",
      emoji: "🐉",
      color: "#ef4444",
      baseHp: 210,
      baseAtk: 14,
      speed: 1.55,
      xp: 130,
      gold: 160,
      gems: 10,
      relicId: "wyrm_scale"
    },
    {
      id: "crystal_sovereign",
      name: "CRYSTAL SOVEREIGN",
      emoji: "👾",
      color: "#38bdf8",
      baseHp: 300,
      baseAtk: 18,
      speed: 1.3,
      xp: 190,
      gold: 260,
      gems: 16,
      relicId: "sovereign_prism"
    },
    {
      id: "void_kronos",
      name: "VOID TITAN KRONOS",
      emoji: "👑",
      color: "#c084fc",
      baseHp: 420,
      baseAtk: 24,
      speed: 1.4,
      xp: 280,
      gold: 420,
      gems: 25,
      relicId: "void_crown"
    }
  ];

  // Permanent Rare Boss Relics
  const BOSS_RELICS = {
    granite_heart: {
      id: "granite_heart",
      name: "Granite Heart",
      emoji: "🫀",
      color: "#f97316",
      bonusText: "+60 Max HP & +8 ATK"
    },
    wyrm_scale: {
      id: "wyrm_scale",
      name: "Wyrmfire Scale",
      emoji: "🔥",
      color: "#ef4444",
      bonusText: "+20% Sell Value & +0.35 Speed"
    },
    sovereign_prism: {
      id: "sovereign_prism",
      name: "Sovereign Prism",
      emoji: "💠",
      color: "#38bdf8",
      bonusText: "+15% Egg Chance & +20% XP"
    },
    void_crown: {
      id: "void_crown",
      name: "Kronos Void Crown",
      emoji: "👑",
      color: "#c084fc",
      bonusText: "+25 ATK, +100 HP & +25% Sell Value"
    }
  };

  // Smashcenter Add-Ons Catalog (Blueprints bought from Hudson -> Crafted with Ores)
  const ADDON_CATALOG = {
    refinery: {
      id: "refinery",
      name: "Ore Refinery",
      emoji: "🏭",
      color: "#fbbf24",
      blueprintCost: 80,
      maxLevel: 5,
      baseOres: { stone: 12, iron: 4, gems: 0 },
      desc: "Smelts raw ores in Smashcenter. Increases all ore & gem sell value by +25% per level.",
      campX: 48 * 1.35,
      campY: 48 * 1.35
    },
    drill: {
      id: "drill",
      name: "Auto-Chop Drill",
      emoji: "⚙️",
      color: "#38bdf8",
      blueprintCost: 220,
      maxLevel: 5,
      baseOres: { stone: 20, iron: 12, gems: 2 },
      desc: "Sends seismic pulses every 2.5s that damage nearby rocks around you (50% ATK + 15%/lv).",
      campX: 48 * 2.4,
      campY: 48 * 1.35
    },
    incubator: {
      id: "incubator",
      name: "Egg Incubator",
      emoji: "🌡️",
      color: "#4ade80",
      blueprintCost: 450,
      maxLevel: 5,
      baseOres: { stone: 15, iron: 18, gems: 8 },
      desc: "Boosts Quarry Egg drop chance by +12% per level and grants +15% bonus XP per level.",
      campX: 48 * 3.45,
      campY: 48 * 1.35
    },
    beacon: {
      id: "beacon",
      name: "Smashcenter Beacon",
      emoji: "🗼",
      color: "#c084fc",
      blueprintCost: 950,
      maxLevel: 5,
      baseOres: { stone: 35, iron: 25, gems: 16 },
      desc: "Radiates energy across the quarry: +18 ATK, +50 Max HP, and +0.4 Speed per level.",
      campX: 48 * 1.35,
      campY: 48 * 2.35
    },
    parkour: {
      id: "parkour",
      name: "Parkour Course",
      emoji: "🏃",
      color: "#a3e635",
      blueprintCost: 150,
      maxLevel: 5,
      baseOres: { stone: 15, iron: 8, gems: 2 },
      desc: "Unlocks the Smashcenter Sky-Bridge Parkour Course! Beat it for the Parkour Chikorita pet & PARKOUR MASTER badge (+0.15 Speed/lv).",
      campX: 48 * 2.4,
      campY: 48 * 2.35
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
    },
    parkour_chikorita: {
      id: "parkour_chikorita",
      name: "Parkour Chikorita",
      rarity: "Legendary (Parkour)",
      color: "#a3e635",
      specialSource: "BEAT PARKOUR COURSE",
      desc: "Won by beating the Smashcenter Parkour Course! Adds +14 ATK, +40 Max HP, +0.85 Speed & +20% Gold.",
      hatchWeight: 0,
      atkBonus: 14,
      hpBonus: 40,
      speedBonus: 0.85,
      lootBonus: 0.20
    },
    pyre_drake: {
      id: "pyre_drake",
      name: "Pyre Drake",
      rarity: "Mythic (Boss Drop)",
      color: "#f43f5e",
      specialSource: "DEFEAT BOSSES",
      desc: "Rare Quarry Boss companion! Adds +22 ATK, +45 Max HP, +0.5 Speed & +20% Gold.",
      hatchWeight: 0,
      atkBonus: 22,
      hpBonus: 45,
      speedBonus: 0.5,
      lootBonus: 0.20
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
    { id: "common", label: "Common", color: "#9ca3af", rockFill: "#6b7280", rockTop: "#9ca3af", fleck: "#d1d5db", hpMult: 1.0, xp: 4, dropType: "stone", dropCount: 1, goldBonus: 0, eggChance: 0.08, dropEmoji: "🪨" },
    { id: "uncommon", label: "Uncommon", color: "#4ade80", rockFill: "#4b5563", rockTop: "#4ade80", fleck: "#86efac", hpMult: 1.5, xp: 8, dropType: "iron", dropCount: 2, goldBonus: 0, eggChance: 0.14, dropEmoji: "🔩" },
    { id: "rare", label: "Rare", color: "#38bdf8", rockFill: "#334155", rockTop: "#38bdf8", fleck: "#bae6fd", hpMult: 2.2, xp: 14, dropType: "gem", dropCount: 1, goldBonus: 5, eggChance: 0.22, dropEmoji: "💎" },
    { id: "epic", label: "Epic", color: "#c084fc", rockFill: "#3b2854", rockTop: "#c084fc", fleck: "#f0abfc", hpMult: 3.1, xp: 24, dropType: "gem", dropCount: 3, goldBonus: 12, eggChance: 0.32, dropEmoji: "💎" },
    { id: "mythic", label: "Mythic", color: "#fbbf24", rockFill: "#78350f", rockTop: "#fbbf24", fleck: "#fef08a", hpMult: 4.4, xp: 40, dropType: "gem", dropCount: 5, goldBonus: 25, eggChance: 0.45, dropEmoji: "👑" },
    { id: "exotic", label: "Exotic", color: "#f43f5e", rockFill: "#4c0519", rockTop: "#f43f5e", fleck: "#fda4af", hpMult: 6.0, xp: 65, dropType: "gem", dropCount: 8, goldBonus: 45, eggChance: 0.58, dropEmoji: "🌺" },
    { id: "secret", label: "Secret", color: "#14b8a6", rockFill: "#042f2e", rockTop: "#2dd4bf", fleck: "#99f6e4", hpMult: 8.0, xp: 95, dropType: "gem", dropCount: 12, goldBonus: 75, eggChance: 0.70, dropEmoji: "🗝️" },
    { id: "divine", label: "Divine", color: "#fef08a", rockFill: "#422006", rockTop: "#fef08a", fleck: "#ffffff", hpMult: 10.5, xp: 140, dropType: "gem", dropCount: 18, goldBonus: 120, eggChance: 0.80, dropEmoji: "👼" },
    { id: "galactic", label: "Galactic", color: "#818cf8", rockFill: "#1e1b4b", rockTop: "#818cf8", fleck: "#e0e7ff", hpMult: 13.5, xp: 200, dropType: "gem", dropCount: 26, goldBonus: 190, eggChance: 0.90, dropEmoji: "🌌" },
    { id: "glitched", label: "Glitched", color: "#22d3ee", rockFill: "#0f172a", rockTop: "#22d3ee", fleck: "#f43f5e", hpMult: 17.0, xp: 290, dropType: "gem", dropCount: 38, goldBonus: 300, eggChance: 0.95, dropEmoji: "👾" },
    { id: "apex_purple", label: "Apex Purple", color: "#a855f7", rockFill: "#2e1065", rockTop: "#c084fc", fleck: "#f5d0fe", hpMult: 22.0, xp: 450, dropType: "gem", dropCount: 55, goldBonus: 500, eggChance: 1.0, dropEmoji: "🔮" }
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
    bossKills: 0,
    parkourMaster: false,
    parkourClears: 0,
    dailyChallengesCompleted: 0,
    dailyState: {
      date: "",
      challenges: []
    },
    bossRelics: {
      granite_heart: false,
      wyrm_scale: false,
      sovereign_prism: false,
      void_crown: false
    },
    boss: null,
    blueprints: {
      refinery: false,
      drill: false,
      incubator: false,
      beacon: false,
      parkour: false
    },
    addons: {
      refinery: 0,
      drill: 0,
      incubator: 0,
      beacon: 0,
      parkour: 0
    },
    drillTimer: 0,
    ownedPets: {
      potato_rock: 0,
      chungo: 0,
      slab: 0,
      grail: 0,
      parkour_chikorita: 0,
      pyre_drake: 0
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
    parkour: {
      active: false,
      leapTimer: 0,
      leapCooldown: 0,
      checkpointIdx: 0,
      checkpointX: TILE * 2.5,
      checkpointY: TILE * 9.5,
      savedQuarryPos: { x: TILE * 2.5, y: TILE * 2.5 },
      platforms: [],
      movers: [],
      hazards: [],
      checkpoints: [],
      finish: { x: TILE * 25.5, y: TILE * 9.5 }
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
  // DAILY CHALLENGES ENGINE (UTC ROTATION & INSTANT XP REWARDS)
  // =========================================================
  function getTodayUtcKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function ensureDailyChallenges() {
    const today = getTodayUtcKey();
    if (
      state.dailyState &&
      state.dailyState.date === today &&
      Array.isArray(state.dailyState.challenges) &&
      state.dailyState.challenges.length === 4
    ) {
      return;
    }

    // Deterministic daily selection of 4 distinct challenges for today's UTC date
    const daySeed = Math.floor(Date.now() / 86400000);
    const pool = [...DAILY_CHALLENGE_POOL];
    const chosen = [];
    let s = daySeed * 1664525 + 1013904223;
    while (chosen.length < 4 && pool.length > 0) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const idx = s % pool.length;
      const picked = pool.splice(idx, 1)[0];
      chosen.push({
        id: picked.id,
        progress: 0,
        completed: false
      });
    }

    state.dailyState = {
      date: today,
      challenges: chosen
    };
  }

  function recordDailyProgress(eventType, amount = 1) {
    if (amount <= 0) return;
    ensureDailyChallenges();
    let anyCompletedNow = false;

    for (const entry of state.dailyState.challenges) {
      if (entry.completed) continue;
      const cfg = DAILY_CHALLENGE_POOL.find((c) => c.id === entry.id);
      if (!cfg || cfg.type !== eventType) continue;

      entry.progress = Math.min(cfg.target, entry.progress + amount);
      if (entry.progress >= cfg.target) {
        entry.completed = true;
        anyCompletedNow = true;
        state.dailyChallengesCompleted = (state.dailyChallengesCompleted || 0) + 1;
        gainXp(cfg.xp);
        addLog(`📋 DAILY CHALLENGE COMPLETE: ${cfg.title}! (+${cfg.xp} XP)`);
        addFloatingText(state.player.x, state.player.y - 36, `DAILY COMPLETE! +${cfg.xp} XP`, "#38bdf8");
      }
    }

    if (anyCompletedNow) {
      saveProgress();
      syncAccountToCloud();
    }
    renderDailyChallengesUI();
  }

  function renderDailyChallengesUI() {
    ensureDailyChallenges();
    const grid = game.querySelector("#dailyChallengesGrid");
    const tabCountEl = game.querySelector("#tabDailyCount");
    const todayProgEl = game.querySelector("#dailyTodayProgress");
    const totalCompEl = game.querySelector("#dailyTotalCompletedText");
    const resetEl = game.querySelector("#dailyResetCountdown");

    const completedToday = state.dailyState.challenges.filter((c) => c.completed).length;
    if (tabCountEl) tabCountEl.textContent = completedToday;
    if (todayProgEl) todayProgEl.textContent = `${completedToday}/4`;
    if (totalCompEl) totalCompEl.textContent = (state.dailyChallengesCompleted || 0).toLocaleString();

    if (resetEl) {
      const now = new Date();
      const nextUtcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
      const minsLeft = Math.max(1, Math.floor((nextUtcMidnight - now.getTime()) / 60000));
      const hrs = Math.floor(minsLeft / 60);
      const mins = minsLeft % 60;
      resetEl.textContent = `Resets in ${hrs}h ${mins}m (00:00 UTC)`;
    }

    if (!grid) return;
    grid.innerHTML = "";

    for (const entry of state.dailyState.challenges) {
      const cfg = DAILY_CHALLENGE_POOL.find((c) => c.id === entry.id);
      if (!cfg) continue;

      const pct = Math.min(100, Math.round((entry.progress / cfg.target) * 100));
      const card = document.createElement("div");
      card.className = "shop-item";
      card.style.borderColor = entry.completed ? "#4ade80" : "";
      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
            <span style="font-weight:900; font-size:15px; color:${cfg.color};"><span class="emoji-color">${cfg.emoji}</span> ${cfg.title}</span>
            <span style="font-size:11px; font-weight:900; color:#38bdf8;">+${cfg.xp} XP</span>
          </div>
          <div style="font-size:12px; color:#cbd5e1; margin-top:4px;">${cfg.desc}</div>
          <div style="margin-top:8px; background:#090d0a; border:1px solid #34493b; height:12px; position:relative;">
            <div style="background:${entry.completed ? "#4ade80" : cfg.color}; width:${pct}%; height:100%;"></div>
          </div>
          <div style="font-size:11px; font-weight:900; color:${entry.completed ? "#4ade80" : "#fde68a"}; margin-top:5px;">
            ${entry.completed ? `✓ COMPLETED (+${cfg.xp} XP AWARDED)` : `Progress: ${entry.progress} / ${cfg.target}`}
          </div>
        </div>
      `;
      grid.appendChild(card);
    }
  }

  // =========================================================
  // PROGRESS SAVER (localStorage)
  // =========================================================
  function buildSavePayload() {
    return {
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
      bossKills: state.bossKills,
      parkourMaster: state.parkourMaster,
      parkourClears: state.parkourClears,
      dailyChallengesCompleted: state.dailyChallengesCompleted,
      dailyState: state.dailyState,
      bossRelics: state.bossRelics,
      blueprints: state.blueprints,
      addons: state.addons,
      ownedPets: state.ownedPets,
      equippedPet: state.equippedPet,
      armorCost: state.armorCost,
      bootsCost: state.bootsCost,
      touchVisible: state.touchVisible,
      updatedAt: Date.now()
    };
  }

  function saveProgress(showNotice = false) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(buildSavePayload()));
      if (showNotice) addLog("💾 Progress saved!");
    } catch (err) {
      // Ignore storage quota errors in restricted frames
    }
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        ensureDailyChallenges();
        return false;
      }
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
      if (typeof data.bossKills === "number") state.bossKills = Math.max(0, data.bossKills);
      state.parkourMaster = Boolean(data.parkourMaster);
      if (typeof data.parkourClears === "number") state.parkourClears = Math.max(0, data.parkourClears);
      if (typeof data.dailyChallengesCompleted === "number") state.dailyChallengesCompleted = Math.max(0, data.dailyChallengesCompleted);

      if (data.dailyState && typeof data.dailyState === "object") {
        state.dailyState = {
          date: String(data.dailyState.date || ""),
          challenges: Array.isArray(data.dailyState.challenges) ? data.dailyState.challenges : []
        };
      }
      ensureDailyChallenges();

      state.bossRelics = { granite_heart: false, wyrm_scale: false, sovereign_prism: false, void_crown: false };
      if (data.bossRelics && typeof data.bossRelics === "object") {
        for (const k of Object.keys(state.bossRelics)) {
          state.bossRelics[k] = Boolean(data.bossRelics[k]);
        }
      }

      state.blueprints = { refinery: false, drill: false, incubator: false, beacon: false, parkour: false };
      if (data.blueprints && typeof data.blueprints === "object") {
        for (const k of Object.keys(state.blueprints)) {
          state.blueprints[k] = Boolean(data.blueprints[k]);
        }
      }

      state.addons = { refinery: 0, drill: 0, incubator: 0, beacon: 0, parkour: 0 };
      if (data.addons && typeof data.addons === "object") {
        for (const k of Object.keys(state.addons)) {
          if (typeof data.addons[k] === "number") {
            state.addons[k] = Math.min(ADDON_CATALOG[k].maxLevel, Math.max(0, data.addons[k]));
          }
        }
      }

      state.ownedPets = { potato_rock: 0, chungo: 0, slab: 0, grail: 0, parkour_chikorita: 0, pyre_drake: 0 };
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
      ensureDailyChallenges();
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
    state.bossKills = 0;
    state.parkourMaster = false;
    state.parkourClears = 0;
    state.dailyChallengesCompleted = 0;
    state.dailyState = { date: "", challenges: [] };
    ensureDailyChallenges();
    state.parkour.active = false;
    state.bossRelics = { granite_heart: false, wyrm_scale: false, sovereign_prism: false, void_crown: false };
    state.boss = null;
    state.blueprints = { refinery: false, drill: false, incubator: false, beacon: false, parkour: false };
    state.addons = { refinery: 0, drill: 0, incubator: 0, beacon: 0, parkour: 0 };
    state.ownedPets = { potato_rock: 0, chungo: 0, slab: 0, grail: 0, parkour_chikorita: 0, pyre_drake: 0 };
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
    const beaconBonus = (state.addons.beacon || 0) * 18;
    const relicBonus = (state.bossRelics.granite_heart ? 8 : 0) + (state.bossRelics.void_crown ? 25 : 0);
    return getActiveChar().baseAtk + getActivePickaxe().atkBonus + (state.level - 1) * 2 + (pet ? pet.atkBonus : 0) + beaconBonus + relicBonus;
  }

  function getTotalMaxHp() {
    const pet = getActivePet();
    const beaconBonus = (state.addons.beacon || 0) * 50;
    const relicBonus = (state.bossRelics.granite_heart ? 60 : 0) + (state.bossRelics.void_crown ? 100 : 0);
    return getActiveChar().baseHp + state.bonusHp + (state.level - 1) * 15 + (pet ? pet.hpBonus : 0) + beaconBonus + relicBonus;
  }

  function getTotalSpeed() {
    const pet = getActivePet();
    const beaconBonus = (state.addons.beacon || 0) * 0.4;
    const parkourBonus = (state.addons.parkour || 0) * 0.15;
    const relicBonus = state.bossRelics.wyrm_scale ? 0.35 : 0;
    return getActiveChar().speed + state.bonusSpeed + (pet ? pet.speedBonus : 0) + beaconBonus + parkourBonus + relicBonus;
  }

  function getTotalLootMult() {
    const pet = getActivePet();
    const refineryBonus = (state.addons.refinery || 0) * 0.25;
    const relicBonus = (state.bossRelics.wyrm_scale ? 0.20 : 0) + (state.bossRelics.void_crown ? 0.25 : 0);
    return getActiveChar().lootMult + (pet ? pet.lootBonus : 0) + refineryBonus + relicBonus;
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
    const badgeTag = state.parkourMaster
      ? ` <span style="color:#fde68a; border-left:1px solid #4a6352; padding-left:6px; margin-left:4px;"><span class="emoji-color">🏅</span> PARKOUR MASTER</span>`
      : "";
    game.querySelector("#activeMinerBadge").innerHTML = `<span class="emoji-color">${ch.avatar}</span> ${ch.name}${badgeTag}`;
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
    state.floatingTexts.push({ x, y, text, color, life: 52 });
  }

  function spawnRockParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 3.2;
      state.particles.push({
        x: Math.round(x),
        y: Math.round(y),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: 4,
        color,
        life: 22 + Math.random() * 12
      });
    }
  }

  function gainXp(amount) {
    const incMult = 1 + (state.addons.incubator || 0) * 0.15 + (state.bossRelics.sovereign_prism ? 0.20 : 0);
    state.xp += Math.round(amount * incMult);
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
  // SMASHCENTER PARKOUR COURSE (SKY-BRIDGE OBSTACLE RUN)
  // =========================================================
  function buildParkourCourse() {
    const pk = state.parkour;
    pk.platforms = [
      { x: TILE * 1, y: TILE * 8, w: TILE * 4, h: TILE * 3, color: "#475569" },
      { x: TILE * 6, y: TILE * 8.5, w: TILE * 2, h: TILE * 2, color: "#64748b" },
      { x: TILE * 9, y: TILE * 8.5, w: TILE * 2, h: TILE * 2, color: "#64748b" },
      { x: TILE * 12, y: TILE * 8, w: TILE * 3, h: TILE * 3, color: "#334155" },
      { x: TILE * 15, y: TILE * 9, w: TILE * 1.5, h: TILE * 1.5, color: "#64748b" },
      { x: TILE * 20, y: TILE * 4, w: TILE * 3, h: TILE * 3, color: "#334155" },
      { x: TILE * 23, y: TILE * 4.5, w: TILE * 3, h: TILE * 2, color: "#475569" },
      { x: TILE * 23.5, y: TILE * 11, w: TILE * 3, h: TILE * 2.5, color: "#334155" },
      { x: TILE * 21, y: TILE * 14, w: TILE * 1.8, h: TILE * 1.8, color: "#64748b" },
      { x: TILE * 16.5, y: TILE * 13.5, w: TILE * 3.5, h: TILE * 3, color: "#14532d", isFinish: true }
    ];

    pk.movers = [
      {
        x: TILE * 17,
        y: TILE * 7.5,
        w: TILE * 2,
        h: TILE * 2,
        startX: TILE * 16.8,
        endX: TILE * 18.8,
        startY: TILE * 8.2,
        endY: TILE * 5.0,
        speed: 0.018,
        phase: 0,
        vx: 0,
        vy: 0
      },
      {
        x: TILE * 24.2,
        y: TILE * 7.2,
        w: TILE * 2,
        h: TILE * 1.8,
        startX: TILE * 24.2,
        endX: TILE * 24.2,
        startY: TILE * 6.8,
        endY: TILE * 9.2,
        speed: 0.022,
        phase: 1.4,
        vx: 0,
        vy: 0
      }
    ];

    pk.hazards = [
      { x: TILE * 23.4, y: TILE * 4.6, w: TILE * 0.9, h: TILE * 1.8, offset: 0 },
      { x: TILE * 24.8, y: TILE * 4.6, w: TILE * 0.9, h: TILE * 1.8, offset: 95 }
    ];

    pk.checkpoints = [
      { id: 0, x: TILE * 2.5, y: TILE * 9.5, label: "START", reached: true },
      { id: 1, x: TILE * 13.5, y: TILE * 9.5, label: "CP 1", reached: false },
      { id: 2, x: TILE * 21.5, y: TILE * 5.5, label: "CP 2", reached: false },
      { id: 3, x: TILE * 25.0, y: TILE * 12.2, label: "CP 3", reached: false }
    ];

    pk.finish = { x: TILE * 18.25, y: TILE * 15.0 };
    pk.checkpointIdx = 0;
    pk.checkpointX = TILE * 2.5;
    pk.checkpointY = TILE * 9.5;
    pk.leapTimer = 0;
    pk.leapCooldown = 0;
  }

  function enterParkourCourse() {
    if ((state.addons.parkour || 0) <= 0) {
      addLog("🔒 Build the Parkour Course Add-On first!");
      return;
    }
    state.parkour.savedQuarryPos = { x: state.player.x, y: state.player.y };
    state.parkour.active = true;
    buildParkourCourse();
    state.player.x = state.parkour.checkpointX;
    state.player.y = state.parkour.checkpointY;
    state.petPos.x = state.player.x - 24;
    state.petPos.y = state.player.y;
    switchTab("quarryTab");
    addLog("🏃 Entered the Smashcenter Parkour Course! Leap gaps with Space / CHOP!");
    addFloatingText(state.player.x, state.player.y - 28, "PARKOUR START!", "#a3e635");
    updateUI();
  }

  function exitParkourCourse(completed = false) {
    state.parkour.active = false;
    state.player.x = state.parkour.savedQuarryPos.x || TILE * 2.5;
    state.player.y = state.parkour.savedQuarryPos.y || TILE * 2.5;
    state.petPos.x = state.player.x - 24;
    state.petPos.y = state.player.y;
    updateUI();
    if (!completed) {
      addLog("🚪 Exited Parkour Course back to Smashcenter.");
    }
  }

  function handleParkourCompleted() {
    const firstClear = !state.parkourMaster;
    state.parkourMaster = true;
    state.parkourClears += 1;
    state.ownedPets.parkour_chikorita = Math.max(1, state.ownedPets.parkour_chikorita || 0);

    if (!state.equippedPet) {
      state.equippedPet = "parkour_chikorita";
      state.maxHp = getTotalMaxHp();
      state.hp = Math.min(state.maxHp, state.hp + 40);
    }

    const parkourLv = Math.max(1, state.addons.parkour || 1);
    const goldReward = 120 + parkourLv * 30;
    state.gold += goldReward;
    gainXp(100);

    exitParkourCourse(true);
    applyCharacterStats(false);
    spawnRockParticles(state.player.x, state.player.y, "#a3e635", 26);

    if (firstClear) {
      addLog("🏅 PARKOUR MASTER BADGE UNLOCKED! Shown above your character & on the Leaderboard!");
      addLog("🌿 NEW PET UNLOCKED: Parkour Chikorita (+14 ATK, +40 HP, +0.85 Speed, +20% Gold)!");
      addFloatingText(state.player.x, state.player.y - 44, "🏅 PARKOUR MASTER!", "#fde68a");
      addFloatingText(state.player.x, state.player.y - 24, "🌿 GOT PARKOUR CHIKORITA!", "#a3e635");
    } else {
      addLog(`🏆 Cleared Parkour Course again! (+${goldReward}G & +100 XP)`);
      addFloatingText(state.player.x, state.player.y - 28, `COURSE CLEAR! +${goldReward}G`, "#a3e635");
    }

    recordDailyProgress("parkour", 1);
    recordDailyProgress("gold_earned", goldReward);

    saveProgress(true);
    syncAccountToCloud();
    updateUI();
  }

  function parkourLeap() {
    const pk = state.parkour;
    if (pk.leapTimer > 0 || pk.leapCooldown > 0) return;
    pk.leapTimer = 14;
    pk.leapCooldown = 22;
    spawnRockParticles(state.player.x, state.player.y + 10, "#a3e635", 6);
  }

  function updateParkour() {
    const pk = state.parkour;
    const p = state.player;
    if (pk.leapTimer > 0) pk.leapTimer--;
    if (pk.leapCooldown > 0) pk.leapCooldown--;

    const t = Date.now();
    for (const m of pk.movers) {
      const prevX = m.x;
      const prevY = m.y;
      const wave = (Math.sin(t * m.speed * 0.06 + m.phase) + 1) * 0.5;
      m.x = m.startX + (m.endX - m.startX) * wave;
      m.y = m.startY + (m.endY - m.startY) * wave;
      m.vx = m.x - prevX;
      m.vy = m.y - prevY;
    }

    let dx = 0;
    let dy = 0;
    if (state.keys["w"] || state.keys["ArrowUp"] || state.touchDirs.up) dy -= 1;
    if (state.keys["s"] || state.keys["ArrowDown"] || state.touchDirs.down) dy += 1;
    if (state.keys["a"] || state.keys["ArrowLeft"] || state.touchDirs.left) dx -= 1;
    if (state.keys["d"] || state.keys["ArrowRight"] || state.touchDirs.right) dx += 1;

    const baseSpd = getTotalSpeed();
    const spd = pk.leapTimer > 0 ? baseSpd + 3.9 : baseSpd;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      p.dirX = dx;
      p.dirY = dy;
      p.x = Math.max(TILE, Math.min((COLS - 1) * TILE, p.x + dx * spd));
      p.y = Math.max(TILE, Math.min((ROWS - 1) * TILE, p.y + dy * spd));
    } else if (pk.leapTimer > 0) {
      p.x = Math.max(TILE, Math.min((COLS - 1) * TILE, p.x + p.dirX * spd));
      p.y = Math.max(TILE, Math.min((ROWS - 1) * TILE, p.y + p.dirY * spd));
    }

    state.petPos.x += (p.x - p.dirX * 26 - state.petPos.x) * 0.14;
    state.petPos.y += (p.y - p.dirY * 26 + 6 - state.petPos.y) * 0.14;

    let onSolid = false;
    for (const plat of pk.platforms) {
      if (p.x >= plat.x - 6 && p.x <= plat.x + plat.w + 6 && p.y >= plat.y - 6 && p.y <= plat.y + plat.h + 6) {
        onSolid = true;
        break;
      }
    }
    if (!onSolid) {
      for (const m of pk.movers) {
        if (p.x >= m.x - 8 && p.x <= m.x + m.w + 8 && p.y >= m.y - 8 && p.y <= m.y + m.h + 8) {
          onSolid = true;
          if (pk.leapTimer === 0) {
            p.x += m.vx;
            p.y += m.vy;
          }
          break;
        }
      }
    }

    for (const cp of pk.checkpoints) {
      if (!cp.reached && Math.hypot(p.x - cp.x, p.y - cp.y) < 34) {
        cp.reached = true;
        pk.checkpointIdx = cp.id;
        pk.checkpointX = cp.x;
        pk.checkpointY = cp.y;
        spawnRockParticles(cp.x, cp.y, "#4ade80", 12);
        addFloatingText(cp.x, cp.y - 22, `CHECKPOINT ${cp.id} SAVED!`, "#4ade80");
        addLog(`🚩 Reached Parkour Checkpoint ${cp.id}/3!`);
      }
    }

    const cycleTick = Math.floor(Date.now() / 16);
    if (pk.leapTimer === 0) {
      for (const hz of pk.hazards) {
        const phase = (cycleTick + hz.offset) % 180;
        const activeSpikes = phase >= 120;
        if (activeSpikes && p.x >= hz.x && p.x <= hz.x + hz.w && p.y >= hz.y && p.y <= hz.y + hz.h) {
          spawnRockParticles(p.x, p.y, "#ef4444", 14);
          addFloatingText(p.x, p.y - 22, "SPIKED! BACK TO CHECKPOINT", "#f87171");
          p.x = pk.checkpointX;
          p.y = pk.checkpointY;
          return;
        }
      }
    }

    if (!onSolid && pk.leapTimer === 0) {
      spawnRockParticles(p.x, p.y, "#38bdf8", 14);
      addFloatingText(p.x, p.y - 20, "FELL! BACK TO CHECKPOINT", "#f87171");
      p.x = pk.checkpointX;
      p.y = pk.checkpointY;
      return;
    }

    if (Math.hypot(p.x - pk.finish.x, p.y - pk.finish.y) < 38) {
      handleParkourCompleted();
      return;
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

  function renderParkour() {
    const pk = state.parkour;
    const worldW = COLS * TILE;
    const worldH = ROWS * TILE;

    const camX = Math.round(Math.max(0, Math.min(worldW - canvas.width, state.player.x - canvas.width / 2)));
    const camY = Math.round(Math.max(0, Math.min(worldH - canvas.height, state.player.y - canvas.height / 2)));

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camX, -camY);

    ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * TILE, 0);
      ctx.lineTo(c * TILE, worldH);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * TILE);
      ctx.lineTo(worldW, r * TILE);
      ctx.stroke();
    }

    for (const plat of pk.platforms) {
      ctx.fillStyle = "#020617";
      ctx.fillRect(plat.x + 4, plat.y + 8, plat.w, plat.h);
      ctx.fillStyle = plat.color;
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.strokeStyle = plat.isFinish ? "#facc15" : "#94a3b8";
      ctx.lineWidth = 3;
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
    }

    for (const m of pk.movers) {
      ctx.fillStyle = "#020617";
      ctx.fillRect(Math.round(m.x) + 4, Math.round(m.y) + 8, m.w, m.h);
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(Math.round(m.x), Math.round(m.y), m.w, m.h);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.strokeRect(Math.round(m.x), Math.round(m.y), m.w, m.h);
    }

    const cycleTick = Math.floor(Date.now() / 16);
    for (const hz of pk.hazards) {
      const phase = (cycleTick + hz.offset) % 180;
      const isWarning = phase >= 85 && phase < 120;
      const isActive = phase >= 120;
      ctx.fillStyle = isActive ? "#dc2626" : isWarning ? "#d97706" : "#1e293b";
      ctx.fillRect(hz.x, hz.y, hz.w, hz.h);
      ctx.strokeStyle = isActive ? "#fca5a5" : isWarning ? "#fde047" : "#475569";
      ctx.lineWidth = 2;
      ctx.strokeRect(hz.x, hz.y, hz.w, hz.h);
      if (isActive) {
        ctx.fillStyle = "#ffffff";
        ctx.font = EMOJI_FONT(20);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🔥", hz.x + hz.w / 2, hz.y + hz.h / 2);
      }
    }

    for (const cp of pk.checkpoints) {
      ctx.fillStyle = "#ffffff";
      ctx.font = EMOJI_FONT(24);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(cp.reached ? "🚩" : "🏳️", cp.x, cp.y);
      ctx.font = "bold 10px 'Courier New', monospace";
      ctx.fillStyle = cp.reached ? "#4ade80" : "#cbd5e1";
      ctx.fillText(cp.label, cp.x, cp.y - 20);
    }

    const bob = Math.round(Math.sin(Date.now() * 0.007) * 4);
    ctx.fillStyle = "#ffffff";
    ctx.font = EMOJI_FONT(34);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🏆", pk.finish.x, pk.finish.y + bob);
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#fde047";
    ctx.fillText("FINISH", pk.finish.x, pk.finish.y - 26);

    const activePet = getActivePet();
    if (activePet) {
      drawEquippedPet(activePet, state.petPos.x, state.petPos.y);
    }

    const p = state.player;
    const ch = getActiveChar();
    const leapLift = pk.leapTimer > 0 ? Math.sin((pk.leapTimer / 14) * Math.PI) * 18 : 0;

    ctx.save();
    ctx.translate(Math.round(p.x), Math.round(p.y));

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(-12, 11, 24, 6);

    ctx.translate(0, -Math.round(leapLift));
    ctx.fillStyle = "#ffffff";
    ctx.font = EMOJI_FONT(30);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ch.avatar, 0, 0);

    drawCharacterHeader(ch.name.toUpperCase());
    ctx.restore();

    for (const pt of state.particles) {
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
    }
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.textAlign = "center";
    for (const ft of state.floatingTexts) {
      ctx.fillStyle = "#000000";
      ctx.fillText(ft.text, Math.round(ft.x) + 1, Math.round(ft.y) + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
    }

    ctx.restore();

    const barW = Math.min(460, canvas.width - 24);
    const barX = Math.round((canvas.width - barW) / 2);
    ctx.fillStyle = "rgba(9, 13, 10, 0.9)";
    ctx.fillRect(barX, 10, barW, 34);
    ctx.strokeStyle = "#a3e635";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, 10, barW, 34);

    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#a3e635";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`🏃 PARKOUR COURSE | CP ${pk.checkpointIdx}/3`, barX + 10, 27);

    ctx.fillStyle = pk.leapCooldown === 0 ? "#fde047" : "#9ca3af";
    ctx.textAlign = "right";
    ctx.fillText(pk.leapCooldown === 0 ? "[SPACE/CHOP: LEAP READY]" : "RECHARGING...", barX + barW - 10, 27);
  }

  // =========================================================
  // QUARRY BOSS SPAWNING & RARE BOSS DROPS
  // =========================================================
  function spawnQuarryBoss(customX = null, customY = null) {
    const bossIdx = Math.floor((Math.max(1, state.floor) - 1) / 3) % BOSS_CATALOG.length;
    const template = BOSS_CATALOG[bossIdx];
    const scale = 1 + (state.floor - 1) * 0.28;

    const bx = customX !== null ? customX : TILE * (COLS - 5);
    const by = customY !== null ? customY : TILE * (ROWS - 5);

    const br = Math.floor(by / TILE);
    const bc = Math.floor(bx / TILE);
    for (let r = br - 1; r <= br + 1; r++) {
      for (let c = bc - 1; c <= bc + 1; c++) {
        if (state.grid[r] && state.grid[r][c] && state.grid[r][c].type === "rock" && !state.grid[r][c].hasGate) {
          state.grid[r][c] = { type: "ground", variant: (r + c) % 3 };
        }
      }
    }

    const maxHp = Math.round(template.baseHp * scale);
    state.boss = {
      ...template,
      x: bx,
      y: by,
      hp: maxHp,
      maxHp,
      atk: Math.round(template.baseAtk * (1 + (state.floor - 1) * 0.18)),
      slamTimer: 0,
      slamWindup: 0,
      hitFlash: 0
    };

    addLog(`👹 BOSS ALERT: ${template.name} (${maxHp} HP) has appeared!`);
    addFloatingText(state.player.x, state.player.y - 34, `BOSS: ${template.name}!`, template.color);
    updateUI();
  }

  function handleBossDefeated(boss) {
    const mult = getTotalLootMult();
    state.bossKills += 1;
    state.boss = null;

    spawnRockParticles(boss.x, boss.y, boss.color, 26);
    addLog(`🏆 DEFEATED ${boss.name}! (+${boss.xp} XP)`);
    addFloatingText(boss.x, boss.y - 24, "BOSS DEFEATED!", "#fbbf24");
    gainXp(boss.xp);
    recordDailyProgress("bosses", 1);

    const goldDrop = Math.round(boss.gold * (1 + (state.floor - 1) * 0.2) * mult);
    const gemDrop = Math.ceil(boss.gems * mult);
    state.drops.push({ x: boss.x - 14, y: boss.y, type: "gold", amount: goldDrop, emoji: "💰" });
    state.drops.push({ x: boss.x + 14, y: boss.y, type: "gem", amount: gemDrop, emoji: "💎" });
    state.drops.push({ x: boss.x, y: boss.y - 12, type: "egg", amount: 1, emoji: "🥚" });

    const relic = BOSS_RELICS[boss.relicId];
    if (relic && !state.bossRelics[relic.id] && Math.random() < 0.75) {
      state.bossRelics[relic.id] = true;
      state.maxHp = getTotalMaxHp();
      state.hp = Math.min(state.maxHp, state.hp + 60);
      addLog(`👑 RARE BOSS RELIC DROPPED: ${relic.emoji} ${relic.name} (${relic.bonusText})!`);
      addFloatingText(boss.x, boss.y - 42, `RELIC: ${relic.name.toUpperCase()}!`, relic.color);
    }

    if (Math.random() < 0.30) {
      state.ownedPets.pyre_drake = (state.ownedPets.pyre_drake || 0) + 1;
      if (!state.equippedPet) {
        state.equippedPet = "pyre_drake";
        state.maxHp = getTotalMaxHp();
        state.hp = Math.min(state.maxHp, state.hp + 45);
      }
      addLog(`🐉 MYTHIC BOSS DROP: Pyre Drake companion joined your Pen!`);
      addFloatingText(boss.x, boss.y - 58, "MYTHIC PET: PYRE DRAKE!", "#f43f5e");
    }

    saveProgress();
    updateUI();
  }

  function renderBossRelicsUI() {
    const listEl = game.querySelector("#bossRelicsList");
    const countEl = game.querySelector("#relicCount");
    if (!listEl) return;

    const owned = Object.values(BOSS_RELICS).filter((r) => state.bossRelics[r.id]);
    if (countEl) countEl.textContent = owned.length;

    if (owned.length === 0) {
      listEl.innerHTML = `<span class="rarity-tag" style="color:#6b7280;">Defeat Bosses for Relics</span>`;
      return;
    }

    listEl.innerHTML = owned
      .map(
        (r) =>
          `<span class="rarity-tag" title="${r.bonusText}" style="color:${r.color}; border-color:${r.color};"><span class="emoji-color">${r.emoji}</span> ${r.name}</span>`
      )
      .join("");
  }

  // =========================================================
  // SMASHCENTER ADD-ONS (BLUEPRINTS & ORE CRAFTING)
  // =========================================================
  function getAddonOreCost(addonId, targetLevel) {
    const cfg = ADDON_CATALOG[addonId];
    const scale = Math.pow(1.75, targetLevel - 1);
    return {
      stone: Math.round(cfg.baseOres.stone * scale),
      iron: Math.round(cfg.baseOres.iron * scale),
      gems: Math.round(cfg.baseOres.gems * scale)
    };
  }

  function formatOreCost(cost) {
    const parts = [];
    if (cost.stone > 0) parts.push(`🪨 ${cost.stone} STN`);
    if (cost.iron > 0) parts.push(`🔩 ${cost.iron} IRN`);
    if (cost.gems > 0) parts.push(`💎 ${cost.gems} GEM`);
    return parts.join(" • ");
  }

  function buyBlueprint(addonId) {
    const cfg = ADDON_CATALOG[addonId];
    if (!cfg || state.blueprints[addonId] || state.gold < cfg.blueprintCost) return;
    state.gold -= cfg.blueprintCost;
    state.blueprints[addonId] = true;
    game.querySelector("#hudsonSpeech").textContent = `"Sold! Take that ${cfg.name} Blueprint over to the Add-Ons tab and craft it with your ores!"`;
    addLog(`📐 Bought ${cfg.name} Blueprint from Hudson (${cfg.blueprintCost}G)!`);
    saveProgress();
    updateUI();
  }

  function craftOrUpgradeAddon(addonId) {
    const cfg = ADDON_CATALOG[addonId];
    if (!cfg || !state.blueprints[addonId]) return;
    const curLv = state.addons[addonId] || 0;
    if (curLv >= cfg.maxLevel) return;

    const nextLv = curLv + 1;
    const cost = getAddonOreCost(addonId, nextLv);
    if (state.stone < cost.stone || state.iron < cost.iron || state.gems < cost.gems) return;

    state.stone -= cost.stone;
    state.iron -= cost.iron;
    state.gems -= cost.gems;
    state.addons[addonId] = nextLv;

    if (addonId === "beacon") {
      state.maxHp = getTotalMaxHp();
      state.hp = Math.min(state.maxHp, state.hp + 50);
    }

    const speech = game.querySelector("#addonWorkshopSpeech");
    if (speech) {
      speech.innerHTML = `🏗️ Constructed <b style="color:${cfg.color};">${cfg.name} (LV.${nextLv})</b> in your Smashcenter Base Camp!`;
    }
    addLog(`🏗️ Built ${cfg.name} LV.${nextLv} in Smashcenter!`);
    addFloatingText(state.player.x, state.player.y - 28, `${cfg.name.toUpperCase()} LV.${nextLv}!`, cfg.color);
    saveProgress();
    updateUI();
  }

  function renderAddonsUI() {
    const bpGrid = game.querySelector("#hudsonBlueprintsGrid");
    const wsGrid = game.querySelector("#addonsWorkshopGrid");
    const summaryEl = game.querySelector("#builtAddonsSummary");
    const tabCountEl = game.querySelector("#tabAddonCount");

    let totalBuiltLevels = 0;
    const builtNames = [];
    for (const cfg of Object.values(ADDON_CATALOG)) {
      const lv = state.addons[cfg.id] || 0;
      totalBuiltLevels += lv;
      if (lv > 0) builtNames.push(`${cfg.name} (LV.${lv})`);
    }
    if (tabCountEl) tabCountEl.textContent = totalBuiltLevels;
    if (summaryEl) {
      summaryEl.textContent = builtNames.length > 0
        ? `Active Base Structures: ${builtNames.join(" • ")}`
        : "Active Base Structures: None yet";
    }

    if (bpGrid) {
      bpGrid.innerHTML = "";
      for (const cfg of Object.values(ADDON_CATALOG)) {
        const ownedBp = Boolean(state.blueprints[cfg.id]);
        const lv1Cost = getAddonOreCost(cfg.id, 1);
        const card = document.createElement("div");
        card.className = "shop-item";
        card.innerHTML = `
          <div>
            <div style="font-weight:900; font-size:15px; color:${cfg.color};"><span class="emoji-color">${cfg.emoji}</span> ${cfg.name.toUpperCase()} BLUEPRINT</div>
            <div style="font-size:12px; color:#cbd5e1; margin-top:4px;">${cfg.desc}</div>
            <div style="font-size:11px; color:#fde68a; margin-top:5px;">Build Cost (LV.1): <b>${formatOreCost(lv1Cost)}</b></div>
          </div>
          <button class="mini-btn ${ownedBp ? "secondary" : ""}" ${ownedBp || state.gold < cfg.blueprintCost ? "disabled" : ""}>
            ${ownedBp ? "✓ BLUEPRINT OWNED" : `BUY BLUEPRINT (${cfg.blueprintCost}G)`}
          </button>
        `;
        card.querySelector("button").addEventListener("click", () => buyBlueprint(cfg.id));
        bpGrid.appendChild(card);
      }
    }

    if (wsGrid) {
      wsGrid.innerHTML = "";
      for (const cfg of Object.values(ADDON_CATALOG)) {
        const ownedBp = Boolean(state.blueprints[cfg.id]);
        const curLv = state.addons[cfg.id] || 0;
        const isMaxed = curLv >= cfg.maxLevel;
        const nextCost = !isMaxed ? getAddonOreCost(cfg.id, curLv + 1) : null;
        const canAffordOres = nextCost
          ? state.stone >= nextCost.stone && state.iron >= nextCost.iron && state.gems >= nextCost.gems
          : false;

        const isParkourBuilt = cfg.id === "parkour" && curLv > 0;
        const card = document.createElement("div");
        card.className = "shop-item";
        card.innerHTML = `
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:900; font-size:15px; color:${cfg.color};"><span class="emoji-color">${cfg.emoji}</span> ${cfg.name}</span>
              <span style="font-size:11px; font-weight:900; color:${curLv > 0 ? "#4ade80" : "#9ca3af"};">
                ${curLv > 0 ? `BUILT: LV.${curLv}/${cfg.maxLevel}` : "NOT BUILT"}
              </span>
            </div>
            <div style="font-size:12px; color:#cbd5e1; margin-top:4px;">${cfg.desc}</div>
            <div style="font-size:11px; color:${ownedBp ? "#fde68a" : "#f87171"}; margin-top:6px; font-weight:800;">
              ${!ownedBp
                ? "🔒 Blueprint required — Buy from Hudson's Shop!"
                : isMaxed
                ? "★ MAX LEVEL CONSTRUCTED"
                : `Craft LV.${curLv + 1}: ${formatOreCost(nextCost)}`}
            </div>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="mini-btn craft-addon-btn ${!ownedBp ? "secondary" : ""}" style="flex:1;" ${!ownedBp || isMaxed || !canAffordOres ? "disabled" : ""}>
              ${!ownedBp
                ? "LOCKED (NEED BLUEPRINT)"
                : isMaxed
                ? "MAX LEVEL"
                : curLv === 0
                ? "BUILD ADD-ON"
                : `UPGRADE TO LV.${curLv + 1}`}
            </button>
            ${isParkourBuilt ? `<button class="mini-btn enter-pk-btn" style="background:#15803d; border-color:#4ade80;">🏃 ENTER COURSE</button>` : ""}
          </div>
        `;
        card.querySelector(".craft-addon-btn").addEventListener("click", () => craftOrUpgradeAddon(cfg.id));
        const enterBtn = card.querySelector(".enter-pk-btn");
        if (enterBtn) {
          enterBtn.addEventListener("click", enterParkourCourse);
        }
        wsGrid.appendChild(card);
      }
    }
  }

  // =========================================================
  // EGG HATCHING & PET ROSTER UI
  // =========================================================
  function hatchEgg() {
    if (state.eggs <= 0) return;
    state.eggs -= 1;

    const list = Object.values(PET_CATALOG).filter((p) => !p.specialSource);
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
          ${count === 0 ? `LOCKED (${pet.specialSource || "HATCH EGGS"})` : isEquipped ? "★ EQUIPPED" : "EQUIP COMPANION"}
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
    if (roll < 0.004 + z * 0.002) return RARITIES[10];
    if (roll < 0.011 + z * 0.004) return RARITIES[9];
    if (roll < 0.022 + z * 0.006) return RARITIES[8];
    if (roll < 0.040 + z * 0.009) return RARITIES[7];
    if (roll < 0.068 + z * 0.012) return RARITIES[6];
    if (roll < 0.110 + z * 0.016) return RARITIES[5];
    if (roll < 0.175 + z * 0.020) return RARITIES[4];
    if (roll < 0.270 + z * 0.022) return RARITIES[3];
    if (roll < 0.430 + z * 0.020) return RARITIES[2];
    if (roll < 0.700) return RARITIES[1];
    return RARITIES[0];
  }

  function generateFloor() {
    state.grid = [];
    state.trees = [];
    state.tracks = [];
    state.enemies = [];
    state.drops = [];
    state.particles = [];
    state.boss = null;

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

    if (state.floor % 3 === 0) {
      spawnQuarryBoss(gateC * TILE + TILE / 2, gateR * TILE + TILE / 2);
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

    // Parkour UI controls toggle
    const pkBuilt = (state.addons.parkour || 0) > 0;
    const pkBtn = game.querySelector("#toggleParkourBtn");
    const summonBtn = game.querySelector("#summonBossBtn");
    const newFloorBtn = game.querySelector("#newFloorBtn");
    const hintText = game.querySelector("#controlsHintText");
    const touchIcon = game.querySelector("#touchActionIcon");
    const touchLabel = game.querySelector("#touchActionLabel");

    if (pkBtn) {
      pkBtn.style.display = pkBuilt ? "inline-block" : "none";
      if (state.parkour.active) {
        pkBtn.innerHTML = `<span class="emoji-color">🚪</span> Exit Parkour`;
        pkBtn.style.background = "#991b1b";
        pkBtn.style.borderColor = "#f87171";
      } else {
        pkBtn.innerHTML = `<span class="emoji-color">🏃</span> Enter Parkour`;
        pkBtn.style.background = "#15803d";
        pkBtn.style.borderColor = "#4ade80";
      }
    }

    if (state.parkour.active) {
      if (summonBtn) summonBtn.style.display = "none";
      if (newFloorBtn) newFloorBtn.style.display = "none";
      if (hintText) hintText.innerHTML = `Parkour: <b>WASD / Arrows / D-Pad</b> • Leap Gaps: <b>Space / Click / LEAP</b> • Reach <span class="emoji-color">🏆</span>`;
      if (touchIcon) touchIcon.textContent = "🏃";
      if (touchLabel) touchLabel.textContent = "LEAP";
    } else {
      if (summonBtn) {
        summonBtn.style.display = "inline-block";
        if (state.boss) {
          summonBtn.innerHTML = `<span class="emoji-color">👹</span> Boss Active!`;
          summonBtn.disabled = true;
        } else {
          summonBtn.innerHTML = `<span class="emoji-color">👹</span> Summon Boss (15 STN)`;
          summonBtn.disabled = state.stone < 15;
        }
      }
      if (newFloorBtn) newFloorBtn.style.display = "inline-block";
      if (hintText) hintText.innerHTML = `Move: <b>WASD / Arrows / D-Pad</b> • Chop: <b>Space / Click / CHOP</b> • Find <span class="emoji-color">🪜</span> <b>Gate</b>`;
      if (touchIcon) touchIcon.textContent = "⛏️";
      if (touchLabel) touchLabel.textContent = "CHOP";
    }

    // Account PARKOUR MASTER badge showcase
    const showcase = game.querySelector("#accountBadgeShowcase");
    if (showcase) {
      showcase.style.display = currentUser && state.parkourMaster ? "block" : "none";
    }

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

    renderDailyChallengesUI();
    renderBossRelicsUI();
    renderAddonsUI();
    renderPetRoster();
  }

  function isTileBlocked(px, py) {
    const r = Math.floor(py / TILE);
    const c = Math.floor(px / TILE);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
    const cell = state.grid[r][c];
    return cell.type === "border" || cell.type === "rock";
  }

  function damageRockAt(r, c, dmg, customColor = null) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    const cell = state.grid[r][c];
    if (!cell || cell.type !== "rock") return;

    cell.hp -= dmg;
    const cx = c * TILE + TILE / 2;
    const cy = r * TILE + TILE / 2;
    spawnRockParticles(cx, cy, customColor || cell.rarity.color);
    addFloatingText(cx, cy - 12, `-${dmg}`, customColor || cell.rarity.color);

    if (cell.hp <= 0) {
      const mult = getTotalLootMult();
      const brokenRarity = cell.rarity;
      gainXp(brokenRarity.xp + state.floor);
      recordDailyProgress("rocks", 1);
      if (brokenRarity.xp >= 14) {
        recordDailyProgress("rare_rocks", 1);
      }

      if (cell.hasGate) {
        state.grid[r][c] = { type: "gate" };
        addLog("🪜 Zone Gate uncovered! Step on it to advance.");
        addFloatingText(cx, cy, "NEXT ZONE GATE!", "#4ade80");
      } else {
        state.grid[r][c] = { type: "ground", variant: (r + c) % 3 };
        const qty = Math.ceil(brokenRarity.dropCount * mult);
        state.drops.push({
          x: cx - (brokenRarity.goldBonus > 0 ? 7 : 0),
          y: cy,
          type: brokenRarity.dropType,
          amount: qty,
          emoji: brokenRarity.dropEmoji
        });

        if (brokenRarity.goldBonus > 0) {
          state.drops.push({
            x: cx + 7,
            y: cy,
            type: "gold",
            amount: Math.round(brokenRarity.goldBonus * state.floor * mult),
            emoji: "💰"
          });
        }

        const eggBonus = (state.addons.incubator || 0) * 0.12 + (state.bossRelics.sovereign_prism ? 0.15 : 0);
        if (Math.random() < Math.min(1, brokenRarity.eggChance + eggBonus)) {
          state.drops.push({
            x: cx,
            y: cy - 8,
            type: "egg",
            amount: 1,
            emoji: "🥚"
          });
          addLog(`🥚 A Quarry Egg popped out of the ${brokenRarity.label} rock!`);
        }

        if (brokenRarity.xp >= 24) {
          addLog(`★ Shattered a [${brokenRarity.label.toUpperCase()}] boulder!`);
        }
      }
      saveProgress();
    }
  }

  function performPrimaryAction() {
    if (!state.started) return;
    if (state.parkour.active) {
      parkourLeap();
      return;
    }
    swingPickaxe();
  }

  function swingPickaxe() {
    if (!state.started || state.player.swingTimer > 0) return;
    state.player.swingTimer = 14;

    const totalAtk = getTotalAtk();
    const reach = 42;
    const hitX = state.player.x + state.player.dirX * reach;
    const hitY = state.player.y + state.player.dirY * reach;

    if (state.boss && Math.hypot(state.boss.x - hitX, state.boss.y - hitY) < 58) {
      const b = state.boss;
      b.hp -= totalAtk;
      b.hitFlash = 8;
      spawnRockParticles(b.x, b.y, b.color, 10);
      addFloatingText(b.x, b.y - 26, `-${totalAtk}`, "#fbbf24");
      if (b.hp <= 0) {
        handleBossDefeated(b);
      }
    }

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
          recordDailyProgress("enemies", 1);
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
    damageRockAt(r, c, totalAtk);
    updateUI();
  }

  function update() {
    if (!state.started) return;
    if (state.parkour.active) {
      updateParkour();
      return;
    }

    const p = state.player;
    if (p.swingTimer > 0) p.swingTimer--;
    if (p.invuln > 0) p.invuln--;

    const drillLv = state.addons.drill || 0;
    if (drillLv > 0) {
      state.drillTimer++;
      if (state.drillTimer >= 150) {
        state.drillTimer = 0;
        let nearest = null;
        let bestDist = 140;
        for (let r = 1; r < ROWS - 1; r++) {
          for (let c = 1; c < COLS - 1; c++) {
            if (state.grid[r][c] && state.grid[r][c].type === "rock") {
              const dist = Math.hypot(c * TILE + TILE / 2 - p.x, r * TILE + TILE / 2 - p.y);
              if (dist < bestDist) {
                bestDist = dist;
                nearest = { r, c };
              }
            }
          }
        }
        if (nearest) {
          const drillDmg = Math.max(1, Math.round(getTotalAtk() * (0.35 + 0.15 * drillLv)));
          damageRockAt(nearest.r, nearest.c, drillDmg, "#38bdf8");
          updateUI();
        }
      }
    }

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

    const targetPetX = p.x - p.dirX * 28;
    const targetPetY = p.y - p.dirY * 28 + 6;
    state.petPos.x += (targetPetX - state.petPos.x) * 0.12;
    state.petPos.y += (targetPetY - state.petPos.y) * 0.12;

    const lookR = Math.floor((p.y + p.dirY * 42) / TILE);
    const lookC = Math.floor((p.x + p.dirX * 42) / TILE);
    const targetInfo = game.querySelector("#targetRockInfo");
    if ((state.addons.parkour || 0) > 0 && Math.hypot(ADDON_CATALOG.parkour.campX - p.x, ADDON_CATALOG.parkour.campY - p.y) < 38) {
      targetInfo.innerHTML = `<span style="color:#a3e635; font-weight:900;">[PARKOUR COURSE — Click Enter Parkour]</span>`;
    } else if (state.boss && Math.hypot(state.boss.x - p.x, state.boss.y - p.y) < 120) {
      targetInfo.innerHTML = `<span style="color:${state.boss.color}; font-weight:900;">[BOSS: ${state.boss.hp}/${state.boss.maxHp} HP]</span>`;
    } else if (state.grid[lookR] && state.grid[lookR][lookC] && state.grid[lookR][lookC].type === "rock") {
      const rk = state.grid[lookR][lookC];
      targetInfo.innerHTML = `<span style="color:${rk.rarity.color}; font-weight:900;">[${rk.rarity.label.toUpperCase()}]</span> (${rk.hp}/${rk.maxHp} HP)`;
    } else {
      targetInfo.textContent = "Walk near a rock";
    }

    const pr = Math.floor(p.y / TILE);
    const pc = Math.floor(p.x / TILE);
    if (state.grid[pr] && state.grid[pr][pc] && state.grid[pr][pc].type === "gate") {
      if (state.boss) {
        if (p.invuln === 0) {
          addFloatingText(p.x, p.y - 22, "DEFEAT BOSS FIRST!", "#f87171");
          p.invuln = 30;
        }
      } else {
        state.floor += 1;
        addLog(`⛰️ Entered Zone ${state.floor}! Higher Galactic & Apex odds!`);
        recordDailyProgress("zones", 1);
        saveProgress();
        generateFloor();
        return;
      }
    }

    for (let i = state.drops.length - 1; i >= 0; i--) {
      const d = state.drops[i];
      if (Math.hypot(p.x - d.x, p.y - d.y) < 30) {
        if (d.type === "gold") {
          state.gold += d.amount;
          recordDailyProgress("gold_earned", d.amount);
        }
        if (d.type === "stone") state.stone += d.amount;
        if (d.type === "iron") state.iron += d.amount;
        if (d.type === "gem") state.gems += d.amount;
        if (d.type === "egg") {
          state.eggs += d.amount;
          addFloatingText(p.x, p.y - 22, "+1 QUARRY EGG!", "#fde68a");
          recordDailyProgress("eggs", d.amount);
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

    if (state.boss) {
      const b = state.boss;
      if (b.hitFlash > 0) b.hitFlash--;
      const dist = Math.hypot(p.x - b.x, p.y - b.y);

      if (b.slamWindup > 0) {
        b.slamWindup--;
        if (b.slamWindup === 0) {
          spawnRockParticles(b.x, b.y, b.color, 18);
          if (dist < 110 && p.invuln === 0) {
            const slamDmg = Math.round(b.atk * 1.45);
            state.hp -= slamDmg;
            p.invuln = 45;
            addFloatingText(p.x, p.y - 22, `-${slamDmg} SLAM!`, "#ef4444");
            if (state.hp <= 0) {
              addLog(`💀 ${getActiveChar().name} was crushed by ${b.name}! Returned to Zone 1 Camp.`);
              state.floor = 1;
              state.hp = state.maxHp;
              saveProgress();
              generateFloor();
              return;
            }
            updateUI();
          }
        }
      } else {
        if (dist < 320 && dist > 26) {
          const vx = ((p.x - b.x) / dist) * b.speed;
          const vy = ((p.y - b.y) / dist) * b.speed;
          if (!isTileBlocked(b.x + vx, b.y)) b.x += vx;
          if (!isTileBlocked(b.x, b.y + vy)) b.y += vy;
        }
        if (dist < 140) {
          b.slamTimer++;
          if (b.slamTimer >= 165) {
            b.slamTimer = 0;
            b.slamWindup = 48;
          }
        }
        if (dist < 34 && p.invuln === 0) {
          state.hp -= b.atk;
          p.invuln = 45;
          addFloatingText(p.x, p.y - 20, `-${b.atk} HP`, "#ef4444");
          if (state.hp <= 0) {
            addLog(`💀 ${getActiveChar().name} fainted against ${b.name}! Returned to Zone 1 Camp.`);
            state.floor = 1;
            state.hp = state.maxHp;
            saveProgress();
            generateFloor();
            return;
          }
          updateUI();
        }
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

  // Draw Character Name + PARKOUR MASTER Badge above character
  function drawCharacterHeader(charName) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(charName, 0, -22);

    if (state.parkourMaster) {
      const bw = 116;
      const bh = 15;
      const by = -42;
      ctx.fillStyle = "rgba(20, 83, 45, 0.94)";
      ctx.fillRect(-bw / 2, by, bw, bh);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-bw / 2, by, bw, bh);

      ctx.font = "bold 9px 'Courier New', monospace";
      ctx.fillStyle = "#fef08a";
      ctx.fillText("🏅 PARKOUR MASTER", 0, by + bh / 2 + 0.5);
    }
  }

  // Draw Built Smashcenter Add-Ons in Base Camp
  function drawCampAddons() {
    const pulse = Math.sin(Date.now() * 0.006);
    for (const cfg of Object.values(ADDON_CATALOG)) {
      const lv = state.addons[cfg.id] || 0;
      if (lv <= 0) continue;

      const x = Math.round(cfg.campX);
      const y = Math.round(cfg.campY);

      ctx.save();
      ctx.translate(x, y);

      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(-16, 8, 32, 8);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-14, -10, 28, 22);
      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(-14, -10, 28, 22);

      ctx.fillStyle = "#ffffff";
      ctx.font = EMOJI_FONT(20);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(cfg.emoji, 0, 1 + Math.round(pulse));

      ctx.font = "bold 9px 'Courier New', monospace";
      ctx.fillStyle = cfg.color;
      ctx.fillText(cfg.id === "parkour" ? "PARKOUR" : `LV.${lv}`, 0, -17);

      ctx.restore();
    }
  }

  // Draw Custom Pixel-Art Quarry Pet Companion
  function drawEquippedPet(pet, px, py) {
    const bob = Math.round(Math.sin(Date.now() * 0.008) * 2);
    const x = Math.round(px);
    const y = Math.round(py) + bob;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(-9, 8 - bob, 18, 4);

    if (pet.id === "potato_rock") {
      ctx.fillStyle = "#78350f";
      ctx.fillRect(-9, -6, 18, 12);
      ctx.fillRect(-7, -8, 14, 16);
      ctx.fillStyle = "#b45309";
      ctx.fillRect(-7, -6, 14, 10);
      ctx.fillStyle = "#d97706";
      ctx.fillRect(-5, -5, 10, 5);
      ctx.fillStyle = "#451a03";
      ctx.fillRect(-5, -3, 2, 2);
      ctx.fillRect(4, 1, 2, 2);
      ctx.fillStyle = "#090d0a";
      ctx.fillRect(-3, -1, 2, 2);
      ctx.fillRect(2, -1, 2, 2);
    } else if (pet.id === "chungo") {
      ctx.fillStyle = "#9d174d";
      ctx.fillRect(-7, -10, 14, 18);
      ctx.fillRect(-5, -12, 10, 2);
      ctx.fillStyle = "#f472b6";
      ctx.fillRect(-5, -10, 10, 16);
      ctx.fillStyle = "#fbcfe8";
      ctx.fillRect(-3, -9, 5, 10);
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(-9, 5, 18, 4);
      ctx.fillStyle = "#090d0a";
      ctx.fillRect(-3, -5, 2, 3);
      ctx.fillRect(2, -5, 2, 3);
      ctx.fillStyle = "#fb7185";
      ctx.fillRect(-2, -1, 5, 3);
    } else if (pet.id === "slab") {
      ctx.fillStyle = "#334155";
      ctx.fillRect(-12, -4, 24, 10);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(-10, -3, 20, 7);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(-9, -3, 18, 3);
      ctx.fillStyle = "#090d0a";
      ctx.fillRect(-4, 0, 2, 2);
      ctx.fillRect(3, 0, 2, 2);
    } else if (pet.id === "grail") {
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
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(-1, -1, 2, 2);
      ctx.fillRect(4, -1, 2, 2);
    } else if (pet.id === "parkour_chikorita") {
      ctx.fillStyle = "#388028";
      ctx.fillRect(-2, -16, 10, 4);
      ctx.fillStyle = "#60A848";
      ctx.fillRect(0, -15, 8, 3);
      ctx.fillStyle = "#98C008";
      ctx.fillRect(-7, -8, 14, 15);
      ctx.fillStyle = "#C8E860";
      ctx.fillRect(-6, -7, 12, 13);
      ctx.fillStyle = "#D8F880";
      ctx.fillRect(-4, -6, 6, 6);
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(-7, -6, 14, 3);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(-1, -6, 3, 3);
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(-10, -5, 3, 2);
      ctx.fillStyle = "#900000";
      ctx.fillRect(-3, -2, 2, 3);
      ctx.fillRect(2, -2, 2, 3);
      ctx.fillStyle = "#388028";
      ctx.fillRect(-5, 2, 3, 2);
      ctx.fillRect(-1, 2, 3, 2);
      ctx.fillRect(3, 2, 3, 2);
      ctx.fillStyle = "#98C008";
      ctx.fillRect(-5, 7, 3, 2);
      ctx.fillRect(2, 7, 3, 2);
    } else if (pet.id === "pyre_drake") {
      ctx.fillStyle = "#991b1b";
      ctx.fillRect(-12, -4, 6, 6);
      ctx.fillRect(6, -4, 6, 6);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(-7, -8, 14, 14);
      ctx.fillStyle = "#f97316";
      ctx.fillRect(-5, -6, 10, 10);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(-3, -2, 6, 5);
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(-4, -5, 2, 2);
      ctx.fillRect(2, -5, 2, 2);
    }

    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.fillStyle = pet.color;
    ctx.textAlign = "center";
    ctx.fillText(pet.name.toUpperCase(), 0, -20);

    ctx.restore();
  }

  // Render Pixel-Art Surface Quarry
  function render() {
    if (!state.started) return;
    if (state.parkour.active) {
      renderParkour();
      return;
    }

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
          const locked = Boolean(state.boss);
          ctx.fillStyle = locked ? "#450a0a" : "#14532d";
          ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
          ctx.strokeStyle = locked ? "#f87171" : "#4ade80";
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 6, y + 6, TILE - 12, TILE - 12);
          ctx.fillStyle = "#ffffff";
          ctx.font = EMOJI_FONT(24);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(locked ? "🔒" : "🪜", x + TILE / 2, y + TILE / 2);
        }
      }
    }

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

    drawCampAddons();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = EMOJI_FONT(34);
    for (const tree of state.trees) {
      ctx.fillText("🌲", tree.x, tree.y);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = EMOJI_FONT(28);
    ctx.fillText("🧑‍💼", TILE * 4.5, TILE * 1.5);
    ctx.fillText("🕵️‍♂️", TILE * 5.5, TILE * 2.2);
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.fillStyle = "#fef08a";
    ctx.fillText("HUDSON", TILE * 4.5, TILE * 1.5 - 20);
    ctx.fillText("PROSPECTOR PHIL", TILE * 5.5, TILE * 2.2 - 20);

    ctx.fillStyle = "#ffffff";
    ctx.font = EMOJI_FONT(22);
    for (const d of state.drops) {
      const bob = Math.round(Math.sin(Date.now() * 0.008 + d.x) * 3);
      ctx.fillText(d.emoji, Math.round(d.x), Math.round(d.y) + bob);
    }

    for (const e of state.enemies) {
      ctx.fillStyle = "#ffffff";
      ctx.font = EMOJI_FONT(28);
      ctx.fillText(e.emoji, Math.round(e.x), Math.round(e.y));
      ctx.fillStyle = "#090d0a";
      ctx.fillRect(Math.round(e.x) - 16, Math.round(e.y) - 22, 32, 5);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(Math.round(e.x) - 15, Math.round(e.y) - 21, Math.round(30 * (e.hp / e.maxHp)), 3);
    }

    if (state.boss) {
      const b = state.boss;
      const bx = Math.round(b.x);
      const by = Math.round(b.y);

      if (b.slamWindup > 0) {
        ctx.save();
        ctx.strokeStyle = b.slamWindup % 6 < 3 ? "#ef4444" : "#facc15";
        ctx.lineWidth = 3;
        ctx.fillStyle = "rgba(239, 68, 68, 0.18)";
        ctx.beginPath();
        ctx.arc(bx, by, 110, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(bx - 22, by + 16, 44, 10);

      ctx.fillStyle = "#ffffff";
      ctx.font = EMOJI_FONT(44);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(b.emoji, bx, by);

      ctx.font = "bold 10px 'Courier New', monospace";
      ctx.fillStyle = b.color;
      ctx.fillText("★ BOSS ★", bx, by - 30);
    }

    const activePet = getActivePet();
    if (activePet) {
      drawEquippedPet(activePet, state.petPos.x, state.petPos.y);
    }

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

    drawCharacterHeader(ch.name.toUpperCase());

    const baseAngle = Math.atan2(p.dirY, p.dirX);
    const swingOffset = p.swingTimer > 0 ? Math.sin((p.swingTimer / 14) * Math.PI) * 1.5 - 0.75 : 0;
    ctx.rotate(baseAngle + swingOffset);

    ctx.fillStyle = "#92400e";
    ctx.fillRect(10, -2, 16, 4);
    ctx.fillStyle = pick.color;
    ctx.fillRect(22, -10, 5, 20);
    ctx.fillRect(20, -8, 4, 4);
    ctx.fillRect(20, 4, 4, 4);

    ctx.restore();

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

    if (state.boss) {
      const b = state.boss;
      const barW = Math.min(420, canvas.width - 32);
      const barX = Math.round((canvas.width - barW) / 2);
      const barY = 12;

      ctx.fillStyle = "rgba(9, 13, 10, 0.88)";
      ctx.fillRect(barX - 4, barY - 4, barW + 8, 34);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(barX - 4, barY - 4, barW + 8, 34);

      ctx.fillStyle = "#1f2937";
      ctx.fillRect(barX, barY + 14, barW, 10);
      ctx.fillStyle = b.color;
      ctx.fillRect(barX, barY + 14, Math.max(2, Math.round(barW * (Math.max(0, b.hp) / b.maxHp))), 10);

      ctx.font = "bold 11px 'Courier New', monospace";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`${b.emoji} ${b.name}`, barX + 2, barY);
      ctx.textAlign = "right";
      ctx.fillText(`${Math.max(0, b.hp)}/${b.maxHp} HP`, barX + barW - 2, barY);
    }
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
    } else if (tabId === "dailyTab") {
      renderDailyChallengesUI();
    } else if (tabId === "leaderboardTab") {
      renderLeaderboardTable();
    }
  }

  game.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Toggle Parkour Course Button
  game.querySelector("#toggleParkourBtn").addEventListener("click", () => {
    if (state.parkour.active) {
      exitParkourCourse(false);
    } else {
      enterParkourCourse();
    }
  });

  // Toggle Touch Controls Button
  game.querySelector("#toggleTouchBtn").addEventListener("click", (e) => {
    state.touchVisible = !state.touchVisible;
    game.querySelector("#touchControls").classList.toggle("hidden", !state.touchVisible);
    e.currentTarget.innerHTML = `<span class="emoji-color">📱</span> Touch: ${state.touchVisible ? "ON" : "OFF"}`;
    saveProgress();
  });

  // Touch D-Pad & Action Listeners
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
    performPrimaryAction();
  };
  touchChopBtn.addEventListener("touchstart", triggerTouchChop, { passive: false });
  touchChopBtn.addEventListener("mousedown", triggerTouchChop);

  // Prospector Phil Dialogue Topics
  const philTips = {
    daily: "\"Open the Daily tab to view 4 fresh Daily Challenges that reset every day at 00:00 UTC! As soon as you finish any challenge, you automatically earn bonus XP and climb the Daily Challenges Completed tab on the Leaderboard!\"",
    parkour: "\"Buy the Parkour Course Blueprint from Hudson (150G) and build it in the Add-Ons tab! Once built, click Enter Parkour, leap across gaps with Space/CHOP, tag all 3 Checkpoint Flags, and reach the Trophy to win the Parkour Chikorita pet and the PARKOUR MASTER badge!\"",
    bosses: "\"A Quarry Boss spawns automatically on every 3rd Zone (Zones 3, 6, 9…), or you can click Summon Boss for 15 Stone! Watch out for their red slam ring—defeating bosses drops permanent Boss Relics and the Mythic Pyre Drake pet!\"",
    addons: "\"Buy Add-On Blueprints from Hudson with Gold, then switch to the Add-Ons tab to craft and upgrade them with Stone, Iron, and Gems! Each built Add-On appears right in your Smashcenter Base Camp!\"",
    pets: "\"Smashing rocks drops Quarry Eggs for 4 companions (Potato Rock, Chungo, Slab, Grail), defeating Bosses can drop the Mythic Pyre Drake, and beating the Parkour Course unlocks Parkour Chikorita (+14 ATK, +40 HP, +0.85 Speed, +20% Gold)!\"",
    rarities: "\"There are 11 rock tiers out here: Common, Uncommon, Rare, Epic, Mythic, Exotic, Secret, Divine, Galactic, Glitched, and Apex Purple! Higher-tier rocks also have a much higher chance to drop Quarry Eggs!\"",
    materials: "\"Visit Hudson's Shop to upgrade your pickaxe material from Wood → Stone → Copper → Iron → Gold → Diamond → Obsidian → Mythril → Voidsteel → Celestial → Apex Purple Pickaxe!\"",
    crew: "\"All-Rounder Neil gets +30% Gold and ores, Xavier swings with extra power and HP to crack bosses and high-tier rocks fast, and Carter sprints across the quarry and Parkour Course with +35% speed!\"",
    random: [
      "\"Prospector Note #104: Once you unlock the PARKOUR MASTER badge, it displays proudly above your character AND under your Miner Account on the global Leaderboard!\"",
      "\"Prospector Note #209: Pair All-Rounder Neil (+30% loot) with the Ore Refinery (+25%/lv) and Parkour Chikorita (+20%) for massive payouts at Hudson's Shop!\"",
      "\"Prospector Note #312: Check the Daily Challenges tab in the Leaderboard to see who has completed the most Daily Challenges across Smashcenter!\""
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
    if (e.key === " ") performPrimaryAction();
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
    performPrimaryAction();
  });

  // Summon Boss Button
  game.querySelector("#summonBossBtn").addEventListener("click", () => {
    if (state.boss || state.stone < 15) return;
    state.stone -= 15;
    const sx = Math.min(TILE * (COLS - 3), state.player.x + TILE * 4);
    const sy = Math.min(TILE * (ROWS - 3), state.player.y + TILE * 2);
    spawnQuarryBoss(sx, sy);
    saveProgress();
  });

  // Hudson Shop, Hatchery & Save Actions
  function sellAllOres() {
    const earned = getSellValue();
    if (earned <= 0) return;
    state.gold += earned;
    state.stone = 0;
    state.iron = 0;
    state.gems = 0;
    recordDailyProgress("gold_earned", earned);
    game.querySelector("#hudsonSpeech").textContent = `"Pleasure doing business! Here's ${earned.toLocaleString()} gold. Need a pickaxe upgrade or an Add-On Blueprint?"`;
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
    game.querySelector("#hudsonSpeech").textContent = `"Fresh off the anvil! Your new ${nextPick.name} will tear right through bosses and rare formations!"`;
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
    game.querySelector("#hudsonSpeech").textContent = `"Light as a feather! You'll sprint right across the Parkour Course and out of Boss slam rings."`;
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
  // ONLINE ACCOUNTS, CLOUD SAVES & LEADERBOARD (FIREBASE)
  // =========================================================
  const firebaseConfig = {
    apiKey: "AIzaSyDo9o2QQsl3uKZRGjKYY-tM8u1e0yE7Ph8",
    authDomain: "rock-chopper.firebaseapp.com",
    databaseURL: "https://rock-chopper-default-rtdb.firebaseio.com",
    projectId: "rock-chopper",
    storageBucket: "rock-chopper.firebasestorage.app",
    messagingSenderId: "557568043109",
    appId: "1:557568043109:web:f4c7c75389bb5815347e8c"
  };

  if (window.firebase && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const auth = window.firebase ? firebase.auth() : null;
  const db = window.firebase ? firebase.database() : null;
  const lbRef = db ? db.ref("leaderboard") : null;
  const savesRef = db ? db.ref("saves") : null;

  let currentUser = null;
  let loggedInAlias = "";
  let lbEntries = {};
  let leaderboardMode = "progress"; // "progress" | "daily"

  function toMinerEmail(username) {
    return `${username.toLowerCase()}@smashcenter.game`;
  }

  function applyCloudSaveData(data) {
    if (!data || typeof data !== "object") return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    loadProgress();
    applyCharacterStats(false);
    generateFloor();
    updateUI();
  }

  game.querySelectorAll(".lb-subtab").forEach((btn) => {
    btn.addEventListener("click", () => {
      leaderboardMode = btn.dataset.lbmode;
      game.querySelectorAll(".lb-subtab").forEach((b) => {
        b.classList.toggle("secondary", b.dataset.lbmode !== leaderboardMode);
      });
      renderLeaderboardTable();
    });
  });

  function renderLeaderboardTable() {
    const thead = game.querySelector("#leaderboardHead");
    const tbody = game.querySelector("#leaderboardBody");
    if (!tbody || !thead) return;

    if (leaderboardMode === "daily") {
      thead.innerHTML = `
        <tr style="border-bottom:2px solid #3f5747; color:#38bdf8;">
          <th style="padding:8px;">RANK</th>
          <th style="padding:8px;">MINER TAG &amp; BADGES</th>
          <th style="padding:8px;">CLASS</th>
          <th style="padding:8px;">DAILY CHALLENGES</th>
          <th style="padding:8px;">LEVEL</th>
          <th style="padding:8px;">ZONE</th>
        </tr>
      `;
    } else {
      thead.innerHTML = `
        <tr style="border-bottom:2px solid #3f5747; color:#fbbf24;">
          <th style="padding:8px;">RANK</th>
          <th style="padding:8px;">MINER TAG &amp; BADGES</th>
          <th style="padding:8px;">CLASS</th>
          <th style="padding:8px;">ZONE</th>
          <th style="padding:8px;">LEVEL</th>
          <th style="padding:8px;">GOLD</th>
        </tr>
      `;
    }

    const list = Object.entries(lbEntries)
      .map(([uid, row]) => ({
        uid,
        ...row,
        dailyCount: Number(
          currentUser && uid === currentUser.uid
            ? Math.max(row.dailyChallengesCompleted || 0, state.dailyChallengesCompleted || 0)
            : (row.dailyChallengesCompleted || 0)
        )
      }))
      .filter((row) => row && row.username)
      .sort((a, b) => {
        if (leaderboardMode === "daily") {
          return (b.dailyCount - a.dailyCount) || (b.level - a.level) || (b.zone - a.zone);
        }
        return (b.zone - a.zone) || (b.level - a.level) || (b.gold - a.gold);
      })
      .slice(0, 25);

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding:10px; color:#9ca3af;">No scores posted yet. Create a Miner Account above to claim #1!</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((row, idx) => {
      const isMe = currentUser && row.uid === currentUser.uid;
      const rankColor = idx === 0 ? "#fbbf24" : idx === 1 ? "#e2e8f0" : idx === 2 ? "#d97706" : "#9ca3af";
      const hasParkourBadge = Boolean(row.parkourMaster || (isMe && state.parkourMaster));
      const badgeHtml = hasParkourBadge
        ? `<div style="margin-top:4px;"><span style="display:inline-block; background:#14532d; border:1px solid #facc15; color:#fef08a; font-size:10px; font-weight:900; padding:1px 6px;"><span class="emoji-color">🏅</span> PARKOUR MASTER</span></div>`
        : "";

      if (leaderboardMode === "daily") {
        return `
          <tr style="border-bottom:1px solid #2b3a30; background:${isMe ? "rgba(56, 189, 248, 0.16)" : "transparent"};">
            <td style="padding:8px; font-weight:900; color:${rankColor};">#${idx + 1}</td>
            <td style="padding:8px; font-weight:900; color:${isMe ? "#fde68a" : "#ffffff"};">
              <div>${row.username}${isMe ? " (YOU)" : ""}</div>
              ${badgeHtml}
            </td>
            <td style="padding:8px; color:#cbd5e1;">${row.miner || "Neil"}</td>
            <td style="padding:8px; font-weight:900; color:#38bdf8;"><span class="emoji-color">📋</span> ${row.dailyCount.toLocaleString()} Completed</td>
            <td style="padding:8px; color:#fbbf24;">LV.${row.level || 1}</td>
            <td style="padding:8px; color:#4ade80;">Zone ${row.zone || 1}</td>
          </tr>
        `;
      }

      return `
        <tr style="border-bottom:1px solid #2b3a30; background:${isMe ? "rgba(217, 119, 6, 0.2)" : "transparent"};">
          <td style="padding:8px; font-weight:900; color:${rankColor};">#${idx + 1}</td>
          <td style="padding:8px; font-weight:900; color:${isMe ? "#fde68a" : "#ffffff"};">
            <div>${row.username}${isMe ? " (YOU)" : ""}</div>
            ${badgeHtml}
          </td>
          <td style="padding:8px; color:#cbd5e1;">${row.miner || "Neil"}</td>
          <td style="padding:8px; font-weight:900; color:#4ade80;">Zone ${row.zone || 1}</td>
          <td style="padding:8px; color:#38bdf8;">LV.${row.level || 1}</td>
          <td style="padding:8px; font-weight:900; color:#fbbf24;">${Number(row.gold || 0).toLocaleString()}G</td>
        </tr>
      `;
    }).join("");
  }

  function syncAccountToCloud() {
    if (!currentUser || !loggedInAlias) return;
    if (lbRef) {
      lbRef.child(currentUser.uid).set({
        username: loggedInAlias,
        miner: getActiveChar().name,
        zone: state.floor,
        level: state.level,
        gold: state.gold,
        parkourMaster: Boolean(state.parkourMaster),
        dailyChallengesCompleted: Number(state.dailyChallengesCompleted || 0),
        updatedAt: Date.now()
      });
    }
    if (savesRef) {
      savesRef.child(currentUser.uid).set(buildSavePayload());
    }
  }

  function updateAuthBanner() {
    const formWrap = game.querySelector("#authFormWrap");
    const loggedInWrap = game.querySelector("#loggedInWrap");
    const statusMsg = game.querySelector("#authStatusMsg");
    const showcase = game.querySelector("#accountBadgeShowcase");

    if (currentUser && loggedInAlias) {
      formWrap.style.display = "none";
      loggedInWrap.style.display = "flex";
      statusMsg.innerHTML = `Signed in as <b style="color:#4ade80;">${loggedInAlias}</b> (Daily Completed: <b style="color:#38bdf8;">${state.dailyChallengesCompleted || 0}</b>) — Progress, badges &amp; scores auto-save!`;
      if (showcase) showcase.style.display = state.parkourMaster ? "block" : "none";
    } else {
      formWrap.style.display = "flex";
      loggedInWrap.style.display = "none";
      statusMsg.textContent = "Create a Miner Account or log in to cloud-save your gear & post to the Leaderboard!";
      if (showcase) showcase.style.display = "none";
    }
  }

  if (lbRef) {
    lbRef.on("value", (snapshot) => {
      lbEntries = snapshot.val() || {};
      renderLeaderboardTable();
    }, (err) => {
      const tbody = game.querySelector("#leaderboardBody");
      if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="padding:10px; color:#f87171;">Database error: ${err.message}</td></tr>`;
    });
  }

  if (auth) {
    auth.onAuthStateChanged(async (user) => {
      currentUser = user;
      if (user) {
        loggedInAlias = user.displayName || user.email.split("@")[0];
        updateAuthBanner();

        if (savesRef) {
          try {
            const snap = await savesRef.child(user.uid).once("value");
            if (snap.exists()) {
              applyCloudSaveData(snap.val());
              addLog(`☁️ Loaded cloud save for ${loggedInAlias} (Zone ${state.floor}, LV.${state.level})!`);
            } else {
              syncAccountToCloud();
            }
          } catch (err) {
            addLog(`⚠️ Cloud save sync warning: ${err.message}`);
          }
        }
        syncAccountToCloud();
      } else {
        loggedInAlias = "";
        updateAuthBanner();
      }
      renderLeaderboardTable();
    });
  }

  game.querySelector("#signUpBtn").addEventListener("click", async () => {
    if (!auth) return;
    const username = game.querySelector("#authUsername").value.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    const password = game.querySelector("#authPassword").value;
    if (username.length < 3 || password.length < 6) {
      game.querySelector("#authStatusMsg").textContent = "Username needs 3+ letters/numbers and Password needs 6+ characters.";
      return;
    }
    game.querySelector("#authStatusMsg").textContent = "Creating Miner Account...";
    try {
      const cred = await auth.createUserWithEmailAndPassword(toMinerEmail(username), password);
      await cred.user.updateProfile({ displayName: username });
      loggedInAlias = username;
      syncAccountToCloud();
      addLog(`🏆 Created Miner Account: ${username}!`);
      updateAuthBanner();
    } catch (err) {
      game.querySelector("#authStatusMsg").textContent = "Account error: " + err.message;
    }
  });

  game.querySelector("#signInBtn").addEventListener("click", async () => {
    if (!auth) return;
    const username = game.querySelector("#authUsername").value.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    const password = game.querySelector("#authPassword").value;
    if (!username || !password) return;
    game.querySelector("#authStatusMsg").textContent = "Logging in...";
    try {
      const cred = await auth.signInWithEmailAndPassword(toMinerEmail(username), password);
      loggedInAlias = cred.user.displayName || username;
      addLog(`🏆 Logged in as ${loggedInAlias}!`);
      updateAuthBanner();
    } catch (err) {
      game.querySelector("#authStatusMsg").textContent = "Login failed: " + err.message;
    }
  });

  game.querySelector("#signOutBtn").addEventListener("click", async () => {
    if (!auth) return;
    await auth.signOut();
    addLog("Logged out of Miner Account.");
  });

  game.querySelector("#syncScoreBtn").addEventListener("click", () => {
    syncAccountToCloud();
    updateAuthBanner();
    addLog("☁️ Synced full save, daily challenges, badges & score to your account!");
  });

  game.querySelector("#resetSaveBtn").addEventListener("click", () => {
    if (currentUser && savesRef) {
      syncAccountToCloud();
    }
  });

  // Auto-sync full save + leaderboard to Firebase whenever saveProgress() runs
  let lastNetSync = 0;
  const origSaveProgress = saveProgress;
  saveProgress = function (showNotice = false) {
    origSaveProgress(showNotice);
    const now = Date.now();
    if (currentUser && loggedInAlias && (showNotice || now - lastNetSync > 6000)) {
      lastNetSync = now;
      syncAccountToCloud();
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