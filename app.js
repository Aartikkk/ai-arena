// AI Arena (Simple + Understandable)
// Now: clearer rules + fun round cards in the combat log

const AIs = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    flavor: "All-rounder strategist with strong structure + debugging energy.",
    stats: { code: 8, writing: 7, research: 6, logic: 8, creativity: 7, speed: 7 }
  },
  {
    id: "claude",
    name: "Claude",
    flavor: "Longform guardian — clarity, nuance, and writing strength.",
    stats: { code: 6, writing: 9, research: 7, logic: 7, creativity: 8, speed: 6 }
  },
  {
    id: "gemini",
    name: "Gemini",
    flavor: "Fast adapter — creative remix + flexible problem-solving vibe.",
    stats: { code: 7, writing: 7, research: 7, logic: 6, creativity: 9, speed: 8 }
  },
  {
    id: "perplexity",
    name: "Perplexity",
    flavor: "Citation sniper — research pressure + fact-driven confidence.",
    stats: { code: 5, writing: 6, research: 9, logic: 7, creativity: 5, speed: 7 }
  }
];

const MAX_HP = 12;
const MAX_ROUNDS = 7;

const Challenges = [
  { type: "Creativity", prompt: "Create a game mechanic that makes studying feel like a quest." },
  { type: "Writing",    prompt: "Write a 2-sentence ‘Why I Play’ statement (honest + emotional)." },
  { type: "Persuasion", prompt: "Pitch AI Arena to the class in 2 sentences (fun + meaning)." },
  { type: "Logic",      prompt: "A game is popular, so it must be good. What’s wrong with that reasoning?" },
  { type: "Research",   prompt: "Give 3 ways you could test if a game improves learning (evidence ideas)." },
  { type: "Coding",     prompt: "Fix the bug: a loop runs 1 extra time — what boundary change prevents it?" }
];

const TypeToStat = {
  Coding: "code",
  Writing: "writing",
  Research: "research",
  Logic: "logic",
  Creativity: "creativity",
  Persuasion: "writing"
};

const MovesByAI = {
  chatgpt: [
    {
      id: "duck",
      name: "Rubber Duck Debug",
      desc: "BEST for CODING rounds: +3 CODE. Otherwise gives +1 LOGIC (small).",
      effect: (type) => (type === "Coding" ? { code: 3 } : { logic: 1 })
    },
    {
      id: "structure",
      name: "Structured Response",
      desc: "SAFE any round: +2 LOGIC +1 WRITING.",
      effect: () => ({ logic: 2, writing: 1 })
    }
  ],
  claude: [
    {
      id: "longform",
      name: "Longform Shield",
      desc: "DEFENSE: Shield 2 reduces damage if you lose. Also +2 WRITING on Writing rounds.",
      effect: (type) => (type === "Writing" ? { writing: 2, shield: 2 } : { shield: 2 })
    },
    {
      id: "nuance",
      name: "Nuance Blade",
      desc: "OFFENSE for Persuasion: +2 WRITING +1 LOGIC. Otherwise +1 WRITING.",
      effect: (type) => (type === "Persuasion" ? { writing: 2, logic: 1 } : { writing: 1 })
    }
  ],
  gemini: [
    {
      id: "scan",
      name: "Multimodal Scan",
      desc: "Speed vibe: +2 SPEED always. Also +2 CREATIVITY on Creativity rounds.",
      effect: (type) => (type === "Creativity" ? { speed: 2, creativity: 2 } : { speed: 2 })
    },
    {
      id: "remix",
      name: "Remix Burst",
      desc: "BIG Creativity boost: +3 CREATIVITY on Creativity rounds. Otherwise +1 WRITING.",
      effect: (type) => (type === "Creativity" ? { creativity: 3 } : { writing: 1 })
    }
  ],
  perplexity: [
    {
      id: "cite",
      name: "Citation Strike",
      desc: "BEST for Research: +3 RESEARCH. Otherwise +1 LOGIC.",
      effect: (type) => (type === "Research" ? { research: 3 } : { logic: 1 })
    },
    {
      id: "factcheck",
      name: "Fact-Check Field",
      desc: "SAFE any round: +2 RESEARCH +1 LOGIC.",
      effect: () => ({ research: 2, logic: 1 })
    }
  ]
};

function getMove(aiId, moveId){
  return (MovesByAI[aiId] || []).find(m => m.id === moveId);
}

let match = null;

function rollD6(){ return 1 + Math.floor(Math.random() * 6); }
function pickChallenge(){ return Challenges[Math.floor(Math.random() * Challenges.length)]; }
const el = (id) => document.getElementById(id);

// Screens
const screens = {
  home: el("screenHome"),
  select: el("screenSelect"),
  arena: el("screenArena")
};
function show(screenKey){
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screens[screenKey].classList.remove("hidden");
}

// UI refs
const p1Select = el("p1Select");
const p2Select = el("p2Select");
const p1Preview = el("p1Preview");
const p2Preview = el("p2Preview");
const p1Name = el("p1Name");
const p2Name = el("p2Name");

const p1MoveSelect = el("p1MoveSelect");
const p2MoveSelect = el("p2MoveSelect");
const p1MoveDesc = el("p1MoveDesc");
const p2MoveDesc = el("p2MoveDesc");

const roundCounter = el("roundCounter");
const challengeBadge = el("challengeBadge");
const challengeText = el("challengeText");
const btnResolveRound = el("btnResolveRound");
const btnNextRound = el("btnNextRound");
const consoleBox = el("console");

const p1MoveReco = el("p1MoveReco");
const p2MoveReco = el("p2MoveReco");

const btnTheme = el("btnTheme");
const roundResult = el("roundResult");
const p1Fighter = el("p1Fighter");
const p2Fighter = el("p2Fighter");

const btnSound = el("btnSound");
const toggleAutoPick = el("toggleAutoPick");
const breakdown = el("breakdown");
const diceTray = el("diceTray");
const p1Die = el("p1Die");
const p2Die = el("p2Die");
const p1DieLabel = el("p1DieLabel");
const p2DieLabel = el("p2DieLabel");
const btnOpenTut = document.getElementById("btnOpenTut");

// -------------------- FUN LOG: round cards --------------------
function logInfo(msg){
  const div = document.createElement("div");
  div.className = "console-line";
  div.textContent = msg;
  consoleBox.appendChild(div);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function logRoundCard({ round, type, winnerText, dmgText, detailLines = [] }){
  const d = document.createElement("details");
  d.className = "log-card";
  d.open = false;

  const summary = document.createElement("summary");
  summary.innerHTML = `
    <span>Round ${round} • ${type} — ${winnerText}</span>
    <span class="pill-mini">${dmgText}</span>
  `;

  const body = document.createElement("div");
  body.className = "log-body";
  body.innerHTML = detailLines.map(x => `<div>${x}</div>`).join("");

  d.appendChild(summary);
  d.appendChild(body);

  consoleBox.appendChild(d);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

// -------------------- UI helpers --------------------
function renderPreview(targetEl, ai){
  const s = ai.stats;
  targetEl.innerHTML = `
    <div><strong>${ai.name}</strong> — ${ai.flavor}</div>
    <div class="hint" style="margin-top:8px;">
      Stats: CODE ${s.code} · WRITING ${s.writing} · RESEARCH ${s.research} · LOGIC ${s.logic} · CREATIVITY ${s.creativity} · SPEED ${s.speed}
    </div>
  `;
}
function fillSelect(selectEl){
  selectEl.innerHTML = AIs.map(ai => `<option value="${ai.id}">${ai.name}</option>`).join("");
}
function getAI(id){ return AIs.find(a => a.id === id); }

function renderStats(containerId, stats){
  const container = el(containerId);
  const entries = [
    ["CODE", "💻", stats.code],
    ["WRITING", "✍️", stats.writing],
    ["RESEARCH", "🔎", stats.research],
    ["LOGIC", "🧠", stats.logic],
    ["CREATIVITY", "🎨", stats.creativity],
    ["SPEED", "⚡", stats.speed]
  ];
  container.innerHTML = entries.map(([k,icon,v]) => `
    <div class="stat">
      <div class="k">${icon} ${k}</div>
      <div class="v">${v}</div>
    </div>
  `).join("");
}

function setHP(side, hp, maxHp){
  el(`${side}HPNum`).textContent = hp;
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  el(`${side}HPFill`).style.width = `${pct}%`;
}

// Dice visuals
function setDiceVisible(v){
  if (!diceTray) return;
  diceTray.classList.toggle("hidden", !v);
}
function animateDice(p1Val, p2Val){
  if (!p1Die || !p2Die) return;
  setDiceVisible(true);

  p1Die.classList.add("rolling");
  p2Die.classList.add("rolling");
  p1Die.textContent = "…";
  p2Die.textContent = "…";

  setTimeout(() => {
    p1Die.classList.remove("rolling");
    p2Die.classList.remove("rolling");
    p1Die.textContent = String(p1Val);
    p2Die.textContent = String(p2Val);
  }, 400);
}

// Floating damage numbers
function floatText(fighterEl, text){
  if (!fighterEl) return;
  const d = document.createElement("div");
  d.className = "float";
  d.textContent = text;

  const x = fighterEl.clientWidth * 0.65;
  const y = fighterEl.clientHeight * 0.22;

  d.style.left = `${x}px`;
  d.style.top  = `${y}px`;

  fighterEl.appendChild(d);
  setTimeout(() => d.remove(), 700);
}

// Breakdown (keep it simple: Skill + Move + Luck)
function renderBreakdown({ type, p1, p2, winnerName, dmgLine }){
  if (!breakdown || !match) return;
  breakdown.classList.remove("hidden");

  breakdown.innerHTML = `
    <div class="row">
      <div class="k">Challenge</div>
      <div class="v">${type}</div>
    </div>

    <div class="row">
      <div class="k">${match.p1.name}</div>
      <div class="v">${p1.base} (skill) + ${p1.bonus} (move) + 🎲${p1.luck} (luck) = <strong>${p1.total}</strong></div>
    </div>

    <div class="row">
      <div class="k">${match.p2.name}</div>
      <div class="v">${p2.base} (skill) + ${p2.bonus} (move) + 🎲${p2.luck} (luck) = <strong>${p2.total}</strong></div>
    </div>

    <div class="row">
      <div class="k">Result</div>
      <div class="v">${winnerName}</div>
    </div>

    <div class="row">
      <div class="k">Damage</div>
      <div class="v">${dmgLine}</div>
    </div>
  `;
}

// Moves UI
function renderMoveSelect(selectEl, descEl, player){
  const moves = MovesByAI[player.ai.id] || [];
  selectEl.innerHTML = moves.map(m => `<option value="${m.id}">${m.name}</option>`).join("");

  if (!player.moveId) player.moveId = moves[0]?.id || null;
  selectEl.value = player.moveId;

  const chosen = getMove(player.ai.id, player.moveId);
  descEl.textContent = chosen ? chosen.desc : "";
}
function renderMovesUI(){
  if (!match) return;
  renderMoveSelect(p1MoveSelect, p1MoveDesc, match.p1);
  renderMoveSelect(p2MoveSelect, p2MoveDesc, match.p2);
}

// Simplified Power calc (no speed bonus)
function computePower(player, type, moveId){
  const ai = player.ai;
  const statKey = TypeToStat[type];
  const base = ai.stats[statKey];

  const move = getMove(ai.id, moveId);
  const eff = move ? move.effect(type) : {};

  const bonus = eff[statKey] || 0;
  const shield = eff.shield || 0;

  const luck = rollD6();
  const total = base + bonus + luck;

  return {
    total, base, bonus, luck, shield,
    statKey,
    moveName: move ? move.name : "—"
  };
}

// Damage tiers (easy to understand)
function baseDamageFromMargin(m){
  if (m <= 2) return 1;
  if (m <= 4) return 2;
  if (m <= 6) return 3;
  return 4;
}

function recommendedMove(aiId, type){
  const moves = MovesByAI[aiId] || [];
  if (!type) return moves[0]?.id || null;

  const statKey = TypeToStat[type];
  let best = moves[0];
  let bestScore = -999;

  for (const m of moves){
    const eff = m.effect(type) || {};
    const score = (eff[statKey] || 0) + (eff.shield || 0) * 0.5;
    if (score > bestScore){
      bestScore = score;
      best = m;
    }
  }
  return best?.id || null;
}

// UI updates
function updateRoundUI(){
  if (!match){
    roundCounter.textContent = `Round 0/${MAX_ROUNDS}`;
    challengeBadge.textContent = "—";
    challengeText.textContent = "Click Next Round to start.";
    if (p1MoveReco) p1MoveReco.textContent = "";
    if (p2MoveReco) p2MoveReco.textContent = "";
    if (breakdown) breakdown.classList.add("hidden");
    setDiceVisible(false);
    if (roundResult) roundResult.classList.add("hidden");
    return;
  }

  roundCounter.textContent = `Round ${match.round}/${MAX_ROUNDS}`;
  challengeBadge.textContent = match.challenge ? match.challenge.type : "—";
  challengeText.textContent = match.challenge ? match.challenge.prompt : "Click Next Round to start.";

  if (!match.challenge){
    if (p1MoveReco) p1MoveReco.textContent = "";
    if (p2MoveReco) p2MoveReco.textContent = "";
    return;
  }

  const t = match.challenge.type;
  const r1 = recommendedMove(match.p1.ai.id, t);
  const r2 = recommendedMove(match.p2.ai.id, t);
  const m1 = getMove(match.p1.ai.id, r1);
  const m2 = getMove(match.p2.ai.id, r2);
  if (p1MoveReco) p1MoveReco.textContent = m1 ? `Recommended: ${m1.name}` : "";
  if (p2MoveReco) p2MoveReco.textContent = m2 ? `Recommended: ${m2.name}` : "";
}

// Theme
const themes = ["cotton", "sky", "mint"];
function applyTheme(name){
  document.documentElement.dataset.theme = name;
  localStorage.setItem("ai_arena_theme", name);
}
function getTheme(){
  return localStorage.getItem("ai_arena_theme") || "cotton";
}
if (btnTheme){
  btnTheme.addEventListener("click", () => {
    const cur = document.documentElement.dataset.theme || "cotton";
    const i = themes.indexOf(cur);
    applyTheme(themes[(i + 1) % themes.length]);
  });
}

// ===== Better Offline Sound FX (arcadey) =====
const SFX = (() => {
  let enabled = (localStorage.getItem("ai_arena_sound") ?? "on") === "on";
  let ctx = null, comp = null, master = null;

  function ensure(){
    if (!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();

      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -26;
      comp.knee.value = 30;
      comp.ratio.value = 12;
      comp.attack.value = 0.003;
      comp.release.value = 0.20;

      master = ctx.createGain();
      master.gain.value = 0.9;

      comp.connect(master);
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume().catch(()=>{});
    return ctx;
  }

  function env(g, t0, dur, peak){
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }

  function tone(freq, dur = 0.07, opts = {}){
    if (!enabled) return;
    const c = ensure();
    if (!c) return;

    const o = c.createOscillator();
    const g = c.createGain();
    o.type = opts.type || "triangle";

    const now = c.currentTime;
    o.frequency.setValueAtTime(freq, now);
    if (opts.slideTo){
      o.frequency.exponentialRampToValueAtTime(Math.max(40, opts.slideTo), now + dur);
    }

    env(g, now, dur, (opts.vol ?? 0.07));
    o.connect(g); g.connect(comp);
    o.start(now); o.stop(now + dur + 0.03);
  }

  function setEnabled(v){
    enabled = v;
    localStorage.setItem("ai_arena_sound", enabled ? "on" : "off");
    if (btnSound) btnSound.textContent = `Sound: ${enabled ? "On" : "Off"}`;
  }

  return {
    initButton(){
      if (btnSound) btnSound.textContent = `Sound: ${enabled ? "On" : "Off"}`;
    },
    toggle(){ setEnabled(!enabled); },
    hover(){ tone(620, 0.02, { type:"triangle", vol:0.03 }); },
    click(){ tone(760, 0.03, { type:"square", vol:0.05 }); tone(980, 0.02, { type:"square", vol:0.03 }); },
    roll(){
      for (let i=0;i<6;i++){
        setTimeout(()=>tone(520+Math.random()*380,0.02,{type:"square",vol:0.03}), i*45);
      }
      setTimeout(()=>tone(1180,0.07,{type:"triangle",vol:0.06}), 6*45);
    },
    hit(){ tone(170, 0.11, { type:"sine", vol:0.10, slideTo:90 }); },
    tie(){ tone(420,0.06,{vol:0.05}); tone(390,0.06,{vol:0.04}); },
    win(){ tone(523,0.08,{vol:0.07}); setTimeout(()=>tone(659,0.08,{vol:0.07}),90); setTimeout(()=>tone(784,0.12,{vol:0.08}),180); },
  };
})();

SFX.initButton();
if (btnSound){
  btnSound.addEventListener("click", () => { SFX.click(); SFX.toggle(); });
}

// Navigation buttons
// el("btnGoSelect").addEventListener("click", () => show("select"));
el("btnBackHome").addEventListener("click", () => show("home"));
el("btnBackSelect").addEventListener("click", () => show("select"));
el("btnHome").addEventListener("click", () => show("home"));

el("btnReset").addEventListener("click", () => {
  match = null;
  consoleBox.innerHTML = "";
  btnResolveRound.disabled = true;
  btnNextRound.disabled = true;
  if (breakdown) breakdown.classList.add("hidden");
  setDiceVisible(false);
  if (roundResult) roundResult.classList.add("hidden");
  updateRoundUI();
  show("home");
});

// Auto-pick toggle
if (toggleAutoPick){
  toggleAutoPick.addEventListener("change", () => {
    if (!match) return;
    match.autoPick = !!toggleAutoPick.checked;
    SFX.click();
  });
}

// Start match
el("btnStartGame").addEventListener("click", () => {
  const a1 = getAI(p1Select.value);
  const a2 = getAI(p2Select.value);

  const name1 = p1Name.value || "Team 1";
  const name2 = p2Name.value || "Team 2";

  match = {
    round: 0,
    autoPick: true,
    p1: { name: name1, ai: a1, hp: MAX_HP, moveId: (MovesByAI[a1.id] || [])[0]?.id || null },
    p2: { name: name2, ai: a2, hp: MAX_HP, moveId: (MovesByAI[a2.id] || [])[0]?.id || null },
    challenge: null
  };

  if (toggleAutoPick) toggleAutoPick.checked = true;

  el("p1CardName").textContent = name1;
  el("p1CardAI").textContent = a1.name;
  el("p2CardName").textContent = name2;
  el("p2CardAI").textContent = a2.name;

  renderStats("p1Stats", a1.stats);
  renderStats("p2Stats", a2.stats);

  setHP("p1", MAX_HP, MAX_HP);
  setHP("p2", MAX_HP, MAX_HP);

  if (roundResult) roundResult.classList.add("hidden");
  if (breakdown) breakdown.classList.add("hidden");
  setDiceVisible(false);

  consoleBox.innerHTML = "";
  logInfo("✅ System ready.");
  logInfo("➡️ Click Next Round to begin.");

  btnResolveRound.disabled = true;
  btnNextRound.disabled = false;

  updateRoundUI();
  renderMovesUI();
  show("arena");
});

// Move changes
p1MoveSelect.addEventListener("change", () => {
  if (!match) return;
  match.p1.moveId = p1MoveSelect.value;
  const m = getMove(match.p1.ai.id, match.p1.moveId);
  p1MoveDesc.textContent = m ? m.desc : "";
  SFX.click();
});
p2MoveSelect.addEventListener("change", () => {
  if (!match) return;
  match.p2.moveId = p2MoveSelect.value;
  const m = getMove(match.p2.ai.id, match.p2.moveId);
  p2MoveDesc.textContent = m ? m.desc : "";
  SFX.click();
});

// Next Round
btnNextRound.addEventListener("click", () => {
  if (!match) return;
  if (match.p1.hp <= 0 || match.p2.hp <= 0) return;
  if (match.round >= MAX_ROUNDS) return;

  match.round += 1;
  match.challenge = pickChallenge();

  const t = match.challenge.type;
  if (match.autoPick){
    match.p1.moveId = recommendedMove(match.p1.ai.id, t);
    match.p2.moveId = recommendedMove(match.p2.ai.id, t);
  }
  renderMovesUI();

  logInfo(`🎬 Round ${match.round} begins: ${match.challenge.type}`);
  updateRoundUI();

  btnResolveRound.disabled = false;
  btnNextRound.disabled = true;
});

// Resolve Round
btnResolveRound.addEventListener("click", () => {
  if (!match || !match.challenge) return;

  const type = match.challenge.type;

  // Always use current selected moves (works for auto + manual)
  match.p1.moveId = p1MoveSelect.value;
  match.p2.moveId = p2MoveSelect.value;

  const p1Pow = computePower(match.p1, type, match.p1.moveId);
  const p2Pow = computePower(match.p2, type, match.p2.moveId);

  // Dice = Luck (label it like that)
  if (p1DieLabel) p1DieLabel.textContent = `${match.p1.name} Luck`;
  if (p2DieLabel) p2DieLabel.textContent = `${match.p2.name} Luck`;
  SFX.roll();
  animateDice(p1Pow.luck, p2Pow.luck);

  if (roundResult) roundResult.classList.remove("hidden");

  // Tie
  if (p1Pow.total === p2Pow.total){
    if (roundResult) roundResult.textContent = `🤝 Round Result: Tie`;
    renderBreakdown({
      type,
      p1: p1Pow,
      p2: p2Pow,
      winnerName: "🤝 Tie",
      dmgLine: "No damage"
    });

    logRoundCard({
      round: match.round,
      type,
      winnerText: "Tie",
      dmgText: "0 dmg",
      detailLines: [
        `🎲 Luck rolls: ${match.p1.name} = <b>${p1Pow.luck}</b>, ${match.p2.name} = <b>${p2Pow.luck}</b>`,
        `🧠 Totals tied at <b>${p1Pow.total}</b>. No damage this round.`,
        `Rule: Total = Skill + Move Bonus + Luck (1–6).`
      ]
    });

    SFX.tie();
  } else {
    const winnerKey = p1Pow.total > p2Pow.total ? "p1" : "p2";
    const loserKey  = winnerKey === "p1" ? "p2" : "p1";

    const winnerPow = winnerKey === "p1" ? p1Pow : p2Pow;
    const loserPow  = loserKey === "p1" ? p1Pow : p2Pow;

    const margin = Math.abs(p1Pow.total - p2Pow.total);
    const baseDmg = baseDamageFromMargin(margin);
    const finalDmg = Math.max(0, baseDmg - loserPow.shield);

    match[loserKey].hp -= finalDmg;
    setHP(loserKey, Math.max(0, match[loserKey].hp), MAX_HP);

    if (roundResult) roundResult.textContent = `🏆 Round Winner: ${match[winnerKey].name}`;

    const dmgLine = finalDmg === 0
      ? `Blocked! (base ${baseDmg} - shield ${loserPow.shield} = 0)`
      : `${finalDmg} dmg (base ${baseDmg} - shield ${loserPow.shield})`;

    renderBreakdown({
      type,
      p1: p1Pow,
      p2: p2Pow,
      winnerName: `🏆 ${match[winnerKey].name}`,
      dmgLine
    });

    // Fun visuals
    const winEl = winnerKey === "p1" ? p1Fighter : p2Fighter;
    const loseEl = loserKey === "p1" ? p1Fighter : p2Fighter;
    winEl?.classList.add("glow-win");
    loseEl?.classList.add("glow-lose","hit");
    setTimeout(() => {
      winEl?.classList.remove("glow-win");
      loseEl?.classList.remove("glow-lose","hit");
    }, 650);

    if (finalDmg > 0){
      floatText(loseEl, `-${finalDmg}`);
      SFX.hit();
      SFX.win();
    } else {
      floatText(loseEl, `Blocked!`);
      SFX.tie();
    }

    // Round card log (click to expand)
    logRoundCard({
      round: match.round,
      type,
      winnerText: `${match[winnerKey].name} wins`,
      dmgText: finalDmg === 0 ? "Blocked" : `-${finalDmg} HP`,
      detailLines: [
        `🎭 Moves: ${match.p1.name} used <b>${p1Pow.moveName}</b>, ${match.p2.name} used <b>${p2Pow.moveName}</b>`,
        `🎲 Luck rolls: ${match.p1.name} = <b>${p1Pow.luck}</b>, ${match.p2.name} = <b>${p2Pow.luck}</b>`,
        `📊 Totals: ${match.p1.name} <b>${p1Pow.total}</b> vs ${match.p2.name} <b>${p2Pow.total}</b> (margin <b>${margin}</b>)`,
        `💥 Damage: base <b>${baseDmg}</b> (from margin) - shield <b>${loserPow.shield}</b> = <b>${finalDmg}</b>`,
        `Rule: Total = Skill + Move Bonus + Luck (1–6). Shield blocks damage.`
      ]
    });
  }

  // End checks
  if (match.p1.hp <= 0 || match.p2.hp <= 0){
    const champ = match.p1.hp <= 0 ? match.p2.name : match.p1.name;
    logInfo(`🏁 MATCH END — Winner: ${champ}`);
    btnResolveRound.disabled = true;
    btnNextRound.disabled = true;
    return;
  }

  if (match.round >= MAX_ROUNDS){
    if (match.p1.hp === match.p2.hp) logInfo("🏁 MATCH END — Draw!");
    else logInfo(`🏁 MATCH END — Winner: ${match.p1.hp > match.p2.hp ? match.p1.name : match.p2.name}`);
    btnResolveRound.disabled = true;
    btnNextRound.disabled = true;
    return;
  }

  btnResolveRound.disabled = true;
  btnNextRound.disabled = false;
  match.challenge = null;
  updateRoundUI();
});

// Init
fillSelect(p1Select);
fillSelect(p2Select);

p1Select.value = "chatgpt";
p2Select.value = "claude";

renderPreview(p1Preview, getAI(p1Select.value));
renderPreview(p2Preview, getAI(p2Select.value));

p1Select.addEventListener("change", () => renderPreview(p1Preview, getAI(p1Select.value)));
p2Select.addEventListener("change", () => renderPreview(p2Preview, getAI(p2Select.value)));

btnResolveRound.disabled = true;
btnNextRound.disabled = true;

updateRoundUI();
applyTheme(getTheme());
show("home");

// Home preview randomizer (optional)
(function initHomePreview(){
  const p1 = document.getElementById("homeP1");
  const p2 = document.getElementById("homeP2");
  const t  = document.getElementById("homeType");
  const pr = document.getElementById("homePrompt");
  if (!p1 || !p2 || !t || !pr) return;

  const a = [...AIs];
  const a1 = a[Math.floor(Math.random()*a.length)];
  let a2 = a[Math.floor(Math.random()*a.length)];
  while (a2.id === a1.id) a2 = a[Math.floor(Math.random()*a.length)];

  const ch = Challenges[Math.floor(Math.random()*Challenges.length)];

  // update text
  p1.querySelector(".mf-name").textContent = a1.name;
  p2.querySelector(".mf-name").textContent = a2.name;
  t.textContent = ch.type;
  pr.textContent = `“${ch.prompt}”`;

  // update avatar letters
  p1.querySelector(".avatar").textContent = a1.name[0];
  p2.querySelector(".avatar").textContent = a2.name[0];

  // update small subtitles
  p1.querySelector(".mf-sub").textContent = "Fighter";
  p2.querySelector(".mf-sub").textContent = "Fighter";
})();

// ===== Home "Gamey" Interactions: Shuffle + Tilt =====
(function homeGamey(){
  const card = document.getElementById("homePreviewCard");
  const btn = document.getElementById("btnShufflePreview");

  const p1 = document.getElementById("homeP1");
  const p2 = document.getElementById("homeP2");
  const t  = document.getElementById("homeType");
  const pr = document.getElementById("homePrompt");

  function setHomePreview(){
    if (!p1 || !p2 || !t || !pr) return;

    const list = [...AIs];
    const a1 = list[Math.floor(Math.random() * list.length)];
    let a2 = list[Math.floor(Math.random() * list.length)];
    while (a2.id === a1.id) a2 = list[Math.floor(Math.random() * list.length)];

    const ch = Challenges[Math.floor(Math.random() * Challenges.length)];

    // Text
    p1.querySelector(".mf-name").textContent = a1.name;
    p2.querySelector(".mf-name").textContent = a2.name;
    t.textContent = ch.type;
    pr.textContent = `“${ch.prompt}”`;

    // Avatar letters
    p1.querySelector(".avatar").textContent = a1.name[0];
    p2.querySelector(".avatar").textContent = a2.name[0];

    // Small subs
    p1.querySelector(".mf-sub").textContent = "Fighter";
    p2.querySelector(".mf-sub").textContent = "Fighter";
  }

  // Initial preview
  setHomePreview();

  // Shuffle button
  if (btn){
    btn.addEventListener("click", () => {
      // If SFX exists, give feedback
      try { SFX?.click?.(); SFX?.roll?.(); } catch(e){}
      setHomePreview();

      // Tiny bump animation
      if (card){
        card.style.transform = "translateY(-2px) scale(1.01)";
        setTimeout(() => card.style.transform = "", 140);
      }
    });
  }

  // Tilt/parallax (feels like a game UI)
  if (card){
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;  // 0..1
      const y = (e.clientY - r.top) / r.height;  // 0..1

      const rx = (0.5 - y) * 6; // tilt up/down
      const ry = (x - 0.5) * 8; // tilt left/right

      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  }
})();

// ===== Home: Fighter Roster Carousel + Tutorial + Portal Transition =====
(function homeAllThree(){
  const rosterTrack = document.getElementById("rosterTrack");
  const tutorial = document.getElementById("tutorial");
  const btnCloseTut = document.getElementById("btnCloseTut");
  const btnTutStart = document.getElementById("btnTutStart");
  const portal = document.getElementById("portalOverlay");
  const btnStart = document.getElementById("btnGoSelect");

  function statPick(stats){
    // show 3 "signature" stats for quick glance
    const entries = [
      ["CODE", stats.code],
      ["WRITE", stats.writing],
      ["RESEARCH", stats.research],
      ["LOGIC", stats.logic],
      ["CREATIVE", stats.creativity],
      ["SPEED", stats.speed]
    ];
    entries.sort((a,b)=>b[1]-a[1]);
    return entries.slice(0,3);
  }

  function renderRoster(){
    if (!rosterTrack) return;

    const cards = AIs.map(ai => {
      const top3 = statPick(ai.stats);
      return `
        <div class="roster-card">
          <div class="roster-top">
            <div class="roster-avatar">${ai.name[0]}</div>
            <div>
              <div class="roster-name">${ai.name}</div>
              <div class="roster-flavor">${ai.flavor}</div>
            </div>
          </div>
          <div class="roster-mini">
            ${top3.map(([k,v]) => `<span class="mini-stat">${k} ${v}</span>`).join("")}
          </div>
        </div>
      `;
    }).join("");

    // Duplicate content for seamless scroll
    rosterTrack.innerHTML = cards + cards;
  }

  function showTutorialOnce(){
    if (!tutorial) return;
    const seen = localStorage.getItem("ai_arena_tutorial_seen") === "yes";
    if (!seen){
      tutorial.classList.remove("hidden");
    }
  }

  function hideTutorial(){
    if (!tutorial) return;
    tutorial.classList.add("hidden");
    localStorage.setItem("ai_arena_tutorial_seen","yes");
  }

  function openTutorial(){
    if (!tutorial) return;
    tutorial.classList.remove("hidden");
  }

  function portalTransitionThenGo(){
    if (!portal) { show("select"); return; }
    portal.classList.remove("hidden");
    try { SFX?.roll?.(); } catch(e){}

    // Quick “enter arena” feel
    setTimeout(() => {
      portal.classList.add("hidden");
      show("select");
    }, 850);
  }

  // Wire buttons
  if (btnStart){
    btnStart.addEventListener("click", (e) => {
      // If tutorial is showing, don’t double-trigger
      if (tutorial && !tutorial.classList.contains("hidden")) return;
      portalTransitionThenGo();
      e.preventDefault();
    });
  }

  if (btnTutStart){
    btnTutStart.addEventListener("click", () => {
      hideTutorial();
      portalTransitionThenGo();
    });
  }

  if (btnCloseTut){
    btnCloseTut.addEventListener("click", () => hideTutorial());
  }

  if (btnOpenTut){
    btnOpenTut.addEventListener("click", () => {
      try { SFX?.click?.(); } catch(e){}
      openTutorial();
    });
  }

  // Build roster + show tutorial on home load
  renderRoster();
  showTutorialOnce();
})();

// ===== Hover SFX (small + not spammy) =====
(function attachHoverSFX(){
  let last = 0;

  function play(){
    const now = Date.now();
    if (now - last < 120) return; // debounce
    last = now;
    try { SFX?.hover?.(); } catch(e){}
  }

  function bind(selector){
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener("pointerenter", play);
    });
  }

  // Buttons + interactive home elements
  bind("button.primary");
  bind("button.ghost");
  bind(".preview-card");
  bind(".mini-fighter");
  bind(".roster-card");
})();

// ===== Press Enter to Start (Home only) =====
(function pressEnterToStart(){
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (e.repeat) return;

    // don't trigger while typing
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select") return;

    const home = document.getElementById("screenHome");
    if (!home || home.classList.contains("hidden")) return;

    const tut = document.getElementById("tutorial");
    const tutOpen = tut && !tut.classList.contains("hidden");
    if (tutOpen) return;

    const btn = document.getElementById("btnGoSelect");
    if (!btn) return;

    e.preventDefault();
    try { SFX?.click?.(); } catch(err) {}
    btn.click(); // triggers your portal transition click handler
  });
})();