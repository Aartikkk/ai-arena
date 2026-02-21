// AI Arena (Simple + Understandable)
// - Moves are ALWAYS available (no cooldowns / no disabling)
// - Challenges are Gaming Reality themed
// - Flow: Next Round -> Resolve Round -> HP updates -> repeat

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

// Gaming Reality themed prompts (not random homework-y)
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

// Moves (weapons) — simple bonuses + optional shield
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
      desc: "SAFE any round: +2 LOGIC +1 WRITING. Use when it's NOT Coding.",
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
      desc: "SPEED boost: +2 SPEED always. Also +2 CREATIVITY on Creativity rounds.",
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

// Helpers
function logLine(msg){
  const div = document.createElement("div");
  div.className = "console-line";
  div.textContent = `> ${msg}`;
  consoleBox.appendChild(div);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

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
    ["CODE", stats.code],
    ["WRITING", stats.writing],
    ["RESEARCH", stats.research],
    ["LOGIC", stats.logic],
    ["CREATIVITY", stats.creativity],
    ["SPEED", stats.speed]
  ];
  container.innerHTML = entries.map(([k,v]) => `
    <div class="stat">
      <div class="k">${k}</div>
      <div class="v">${v}</div>
    </div>
  `).join("");
}

function setHP(side, hp, maxHp){
  el(`${side}HPNum`).textContent = hp;
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  el(`${side}HPFill`).style.width = `${pct}%`;
}

function updateRoundUI(){
  // Base round/challenge UI
  if (!match){
    roundCounter.textContent = `Round 0/${MAX_ROUNDS}`;
    challengeBadge.textContent = "—";
    challengeText.textContent = "Click Next Round to start.";

    // clear recommendations (if they exist)
    if (p1MoveReco) p1MoveReco.textContent = "";
    if (p2MoveReco) p2MoveReco.textContent = "";
    return;
  }

  roundCounter.textContent = `Round ${match.round}/${MAX_ROUNDS}`;
  challengeBadge.textContent = match.challenge ? match.challenge.type : "—";
  challengeText.textContent = match.challenge ? match.challenge.prompt : "Click Next Round to start.";

  // Recommendation UI (only when a challenge exists)
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

// Moves UI (always available)
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

// Power calc
function computePower(player, type, moveId){
  const ai = player.ai;
  const statKey = TypeToStat[type];
  const base = ai.stats[statKey];

  const move = getMove(ai.id, moveId);
  const eff = move ? move.effect(type) : {};
  const bonus = eff[statKey] || 0;
  const shield = eff.shield || 0;

  const die = rollD6();
  const speedBonus = Math.floor((ai.stats.speed + (eff.speed || 0)) / 5); // small

  const total = base + bonus + die + speedBonus;

  return { total, base, bonus, die, speedBonus, statKey, shield, moveName: move ? move.name : "—" };
}

function recommendedMove(aiId, type){
  const moves = MovesByAI[aiId] || [];
  if (!type) return moves[0]?.id || null;

  // pick the move that gives the biggest bonus for the current statKey
  const statKey = TypeToStat[type];
  let best = moves[0];
  let bestScore = -999;

  for (const m of moves){
    const eff = m.effect(type) || {};
    const score = (eff[statKey] || 0) + (eff.shield || 0) * 0.5; // shield counts a bit
    if (score > bestScore){
      bestScore = score;
      best = m;
    }
  }
  return best?.id || null;
}

// Navigation buttons
el("btnGoSelect").addEventListener("click", () => show("select"));
el("btnBackHome").addEventListener("click", () => show("home"));
el("btnBackSelect").addEventListener("click", () => show("select"));
el("btnHome").addEventListener("click", () => show("home"));

// Reset (full reset)
el("btnReset").addEventListener("click", () => {
  match = null;
  consoleBox.innerHTML = "";
  btnResolveRound.disabled = true;
  btnNextRound.disabled = true;
  updateRoundUI();
  show("home");
});

// Start match
el("btnStartGame").addEventListener("click", () => {
  const a1 = getAI(p1Select.value);
  const a2 = getAI(p2Select.value);

  const name1 = p1Name.value || "Team 1";
  const name2 = p2Name.value || "Team 2";

  match = {
    round: 0,
    p1: { name: name1, ai: a1, hp: MAX_HP, moveId: (MovesByAI[a1.id] || [])[0]?.id || null },
    p2: { name: name2, ai: a2, hp: MAX_HP, moveId: (MovesByAI[a2.id] || [])[0]?.id || null },
    challenge: null
  };

  // Fill arena cards
  el("p1CardName").textContent = name1;
  el("p1CardAI").textContent = a1.name;
  el("p2CardName").textContent = name2;
  el("p2CardAI").textContent = a2.name;

  renderStats("p1Stats", a1.stats);
  renderStats("p2Stats", a2.stats);

  setHP("p1", MAX_HP, MAX_HP);
  setHP("p2", MAX_HP, MAX_HP);

  // Console
  consoleBox.innerHTML = "";
  logLine("System ready.");
  logLine("Click Next Round to begin.");

  btnResolveRound.disabled = true;
  btnNextRound.disabled = false;

  updateRoundUI();
  renderMovesUI(); // ✅ show moves immediately
  show("arena");
});

// Move changes
p1MoveSelect.addEventListener("change", () => {
  if (!match) return;
  match.p1.moveId = p1MoveSelect.value;
  const m = getMove(match.p1.ai.id, match.p1.moveId);
  p1MoveDesc.textContent = m ? m.desc : "";
});

p2MoveSelect.addEventListener("change", () => {
  if (!match) return;
  match.p2.moveId = p2MoveSelect.value;
  const m = getMove(match.p2.ai.id, match.p2.moveId);
  p2MoveDesc.textContent = m ? m.desc : "";
});

// Next Round
btnNextRound.addEventListener("click", () => {
  if (!match) return;
  if (match.p1.hp <= 0 || match.p2.hp <= 0) return;
  if (match.round >= MAX_ROUNDS) return;

  match.round += 1;
  match.challenge = pickChallenge();

  const t = match.challenge.type;
  match.p1.moveId = recommendedMove(match.p1.ai.id, t);
  match.p2.moveId = recommendedMove(match.p2.ai.id, t);
  renderMovesUI();

  logLine(`Round ${match.round} begins: ${match.challenge.type}`);
  updateRoundUI();

  btnResolveRound.disabled = false;
  btnNextRound.disabled = true;
});

// Resolve Round
btnResolveRound.addEventListener("click", () => {
  if (!match || !match.challenge) return;

  const type = match.challenge.type;

  const p1MoveId = match.p1.moveId || p1MoveSelect.value;
  const p2MoveId = match.p2.moveId || p2MoveSelect.value;

  const p1Pow = computePower(match.p1, type, p1MoveId);
  const p2Pow = computePower(match.p2, type, p2MoveId);

  logLine(`${match.p1.name} used "${p1Pow.moveName}" | base ${p1Pow.base} + bonus ${p1Pow.bonus} + d6 ${p1Pow.die} + spd ${p1Pow.speedBonus} = ${p1Pow.total} | shield ${p1Pow.shield}`);
  logLine(`${match.p2.name} used "${p2Pow.moveName}" | base ${p2Pow.base} + bonus ${p2Pow.bonus} + d6 ${p2Pow.die} + spd ${p2Pow.speedBonus} = ${p2Pow.total} | shield ${p2Pow.shield}`);

  if (p1Pow.total === p2Pow.total){
    logLine("Tie — no damage.");
  } else {
    const winner = p1Pow.total > p2Pow.total ? "p1" : "p2";
    const loser  = winner === "p1" ? "p2" : "p1";

    const margin = Math.abs(p1Pow.total - p2Pow.total);
    const baseDmg = Math.min(4, Math.max(1, Math.ceil(margin / 2)));

    const loserShield = (winner === "p1") ? p2Pow.shield : p1Pow.shield;
    const finalDmg = Math.max(0, baseDmg - loserShield);

    match[loser].hp -= finalDmg;

    logLine(`${match[winner].name} wins by ${margin}. Damage ${baseDmg} - shield ${loserShield} = ${finalDmg}.`);
    setHP(loser, Math.max(0, match[loser].hp), MAX_HP);
  }

  // End checks
  if (match.p1.hp <= 0 || match.p2.hp <= 0){
    const champ = match.p1.hp <= 0 ? match.p2.name : match.p1.name;
    logLine(`MATCH END — Winner: ${champ}`);
    btnResolveRound.disabled = true;
    btnNextRound.disabled = true;
    return;
  }

  if (match.round >= MAX_ROUNDS){
    if (match.p1.hp === match.p2.hp) logLine("MATCH END — Draw!");
    else logLine(`MATCH END — Winner: ${match.p1.hp > match.p2.hp ? match.p1.name : match.p2.name}`);
    btnResolveRound.disabled = true;
    btnNextRound.disabled = true;
    return;
  }

  // ready for next round
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
show("home");