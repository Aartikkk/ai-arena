// AI Arena: Prompt-Powered Boxing Ring
// 2-player fighting game with AI avatars, moves, crits, combos & super meter

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
      id: "neural",
      name: "Neural Strike",
      desc: "Power attack: +3 CODE on Coding, +1 LOGIC otherwise.",
      strategy: "Best on Coding rounds. Use when the challenge matches ChatGPT's code strength.",
      flavor: "ChatGPT's neural networks fire at full power!",
      effect: (type) => (type === "Coding" ? { code: 3 } : { logic: 1 })
    },
    {
      id: "syntax",
      name: "Syntax Shield",
      desc: "Balanced guard: +2 LOGIC +1 WRITING always.",
      strategy: "Safe pick for any round. Use when you're unsure or want consistent output.",
      flavor: "ChatGPT deploys a wall of structured logic!",
      effect: () => ({ logic: 2, writing: 1 })
    },
    {
      id: "overdrive",
      name: "⚡ GPT Overdrive",
      desc: "🔥 SUPER: +4 to primary stat, +1 to all others. Costs 100% energy.",
      strategy: "Save for a crucial round! Massive boost to the challenge's key stat. Use when energy is full and you need a big win.",
      flavor: "💥 SUPER MOVE! ChatGPT enters OVERDRIVE — maximum power unleashed!",
      isSuper: true,
      effect: (type) => {
        const sk = TypeToStat[type] || "logic";
        const b = { code:1, writing:1, research:1, logic:1, creativity:1, speed:1 };
        b[sk] = 4; return b;
      }
    }
  ],
  claude: [
    {
      id: "guardian",
      name: "Guardian Protocol",
      desc: "Shield 2 absorbs damage. +2 WRITING on Writing rounds.",
      strategy: "Best when you expect to lose the round. The shield absorbs 2 damage, keeping you alive longer.",
      flavor: "Claude activates an impenetrable energy barrier!",
      effect: (type) => (type === "Writing" ? { writing: 2, shield: 2 } : { shield: 2 })
    },
    {
      id: "resonance",
      name: "Resonance Blade",
      desc: "Precision strike: +2 WRITING +1 LOGIC on Persuasion, +1 WRITING otherwise.",
      strategy: "Best on Persuasion or Writing rounds where Claude's writing stat shines.",
      flavor: "Claude channels resonance into a devastating slash!",
      effect: (type) => (type === "Persuasion" ? { writing: 2, logic: 1 } : { writing: 1 })
    },
    {
      id: "aegis",
      name: "🛡️ Constitutional Aegis",
      desc: "🔥 SUPER: Shield 4 + reflect 1 damage back. Costs 100% energy.",
      strategy: "Ultimate defense! Use when low on HP. Blocks 4 damage AND reflects 1 back. Great for comebacks.",
      flavor: "💥 SUPER MOVE! Claude summons the AEGIS — total defense!",
      isSuper: true,
      effect: () => ({ shield: 4, writing: 2, reflect: 1 })
    }
  ],
  gemini: [
    {
      id: "quantum",
      name: "Quantum Pulse",
      desc: "Speed strike: +2 SPEED always, +2 CREATIVITY on Creativity rounds.",
      strategy: "Reliable on any round for +2 speed. Even better on Creativity rounds for a double boost.",
      flavor: "Gemini blitzes with quantum-speed processing!",
      effect: (type) => (type === "Creativity" ? { speed: 2, creativity: 2 } : { speed: 2 })
    },
    {
      id: "prism",
      name: "Prism Storm",
      desc: "Creative explosion: +3 CREATIVITY on Creativity, +1 WRITING otherwise.",
      strategy: "Go-to pick for Creativity rounds with a huge +3 bonus. On other rounds, the +1 is modest.",
      flavor: "Gemini unleashes a prismatic storm of ideas!",
      effect: (type) => (type === "Creativity" ? { creativity: 3 } : { writing: 1 })
    },
    {
      id: "fusion",
      name: "✨ Multimodal Fusion",
      desc: "🔥 SUPER: +3 to primary stat, +2 SPEED, +2 CREATIVITY. Costs 100% energy.",
      strategy: "Gemini's nuke! Huge multi-stat boost. Save for a round where you want guaranteed dominance.",
      flavor: "💥 SUPER MOVE! Gemini FUSES all modalities — unstoppable!",
      isSuper: true,
      effect: (type) => {
        const sk = TypeToStat[type] || "creativity";
        const b = { speed:2, creativity:2 };
        b[sk] = (b[sk] || 0) + 3; return b;
      }
    }
  ],
  perplexity: [
    {
      id: "source",
      name: "Source Cannon",
      desc: "Data barrage: +3 RESEARCH on Research, +1 LOGIC otherwise.",
      strategy: "Devastating on Research rounds with +3. On other rounds, only gives +1 — consider alternatives.",
      flavor: "Perplexity fires a concentrated beam of sourced data!",
      effect: (type) => (type === "Research" ? { research: 3 } : { logic: 1 })
    },
    {
      id: "verify",
      name: "Data Shield",
      desc: "Fact defense: +2 RESEARCH +1 LOGIC always.",
      strategy: "Safe and consistent. Good fallback on non-Research rounds for steady stat gains.",
      flavor: "Perplexity raises a barrier of verified facts!",
      effect: () => ({ research: 2, logic: 1 })
    },
    {
      id: "storm",
      name: "📡 Citation Storm",
      desc: "🔥 SUPER: +5 RESEARCH, ignores opponent's shield. Costs 100% energy.",
      strategy: "The ultimate piercing attack! Use against shield-heavy opponents (like Claude) to bypass their defense completely.",
      flavor: "💥 SUPER MOVE! Perplexity summons a CITATION STORM — shields useless!",
      isSuper: true,
      effect: () => ({ research: 5, piercing: true })
    }
  ]
};

// AI SVG logos for ring mode fighter bodies, avatars, roster
const AI_LOGOS = {
  chatgpt: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>`,
  claude: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4.709 15.955l4.397-2.62-.542-.916-4.694 1.208L2.382 11.3l4.726.916.33-1.02L3.75 8.394l1.79-2.535 2.592 3.81.892-.503L8.06 4.22l2.953-1.166 1.07 4.73 1.037-.103.434-4.87L16.72 2.5l-.73 4.87.995.33L19.47 4.16l2.209 2.122-3.36 2.803.627.835 4.571-1.332.82 2.826-4.694 1.208.068 1.054 4.906.437-.373 3.14-4.726-.916-.33 1.02 3.688 2.803-1.79 2.535-2.592-3.81-.892.503.964 4.946-2.953 1.166-1.07-4.73-1.037.103-.434 4.87-3.166.31.73-4.87-.995-.33L7.127 21l-2.21-2.122 3.36-2.803-.626-.835L3.08 16.572z"/></svg>`,
  gemini: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z"/></svg>`,
  perplexity: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.56 2v5.37H2.85L7.56 2zM16.44 2l4.71 5.37h-4.71V2zM8.81 2.98v4.4h2.56V2.36l-2.56.62zM12.63 2.36v5.01h2.56v-4.4l-2.56-.61zM2 8.62h5.56v5.87L2 8.62zM8.81 8.62h2.56v6.67l-2.56-2.56V8.62zM12.63 8.62h2.56v4.1l-2.56 2.57V8.62zM16.44 8.62H22l-5.56 5.87V8.62zM8.81 14.31l2.56 2.56v5.13l-5.81-5.37h.69v-2.32H8.81zM15.19 14.31v2.32h.69l-5.81 5.37v-5.13l2.56-2.56h2.56z"/></svg>`
};

// Fallback emoji icons (if SVG doesn't render)
const AI_ICONS = { chatgpt: "⚡", claude: "🔥", gemini: "✨", perplexity: "📡" };

function getMove(aiId, moveId){
  return (MovesByAI[aiId] || []).find(m => m.id === moveId);
}

let match = null;

/* MODE FUNCTIONS */
function getMode(){
  return localStorage.getItem("ai_arena_mode") || "classic";
}

function setMode(mode){
  localStorage.setItem("ai_arena_mode", mode);
  document.body.dataset.mode = mode;

  // Toggle visibility
  if (ringStage) ringStage.classList.toggle("hidden", mode !== "ring");
  if (arenaGrid) arenaGrid.classList.toggle("hidden", mode === "ring" ? true : false);

  // Toggle active button styles
  if (btnModeClassic) btnModeClassic.classList.toggle("is-active", mode === "classic");
  if (btnModeRing) btnModeRing.classList.toggle("is-active", mode === "ring");

  // Keep classic controls accessible even in ring mode (we’ll upgrade later)
  // For Phase 1, leave .card.inner visible always.
}

// AI id → color class for power bursts
const AI_BURST_COLOR = {
  chatgpt: "green",
  claude: "orange",
  gemini: "purple",
  perplexity: "teal"
};

function syncRingUI(){
  if (!match) return;

  // HUD names
  if (ringP1HudName) ringP1HudName.textContent = match.p1.name;
  if (ringP2HudName) ringP2HudName.textContent = match.p2.name;

  // Set data-ai attribute for AI-specific colors
  if (ringP1) ringP1.setAttribute("data-ai", match.p1.ai.id);
  if (ringP2) ringP2.setAttribute("data-ai", match.p2.ai.id);

  // Set AI logos on fighter characters
  const p1Icon = document.getElementById("ringP1Icon");
  const p2Icon = document.getElementById("ringP2Icon");
  if (p1Icon) p1Icon.innerHTML = AI_LOGOS[match.p1.ai.id] || AI_ICONS[match.p1.ai.id] || "⚡";
  if (p2Icon) p2Icon.innerHTML = AI_LOGOS[match.p2.ai.id] || AI_ICONS[match.p2.ai.id] || "⚡";

  // HUD HP numbers + bars
  const p1hp = Math.max(0, match.p1.hp);
  const p2hp = Math.max(0, match.p2.hp);

  if (ringP1HPNum) ringP1HPNum.textContent = `${p1hp}/${MAX_HP}`;
  if (ringP2HPNum) ringP2HPNum.textContent = `${p2hp}/${MAX_HP}`;

  if (ringP1HPFill) ringP1HPFill.style.width = `${(p1hp / MAX_HP) * 100}%`;
  if (ringP2HPFill) ringP2HPFill.style.width = `${(p2hp / MAX_HP) * 100}%`;

  // Energy meters
  const p1e = match.p1.energy || 0;
  const p2e = match.p2.energy || 0;
  const ep1f = document.getElementById("ringP1EnergyFill");
  const ep2f = document.getElementById("ringP2EnergyFill");
  const ep1l = document.getElementById("ringP1EnergyLabel");
  const ep2l = document.getElementById("ringP2EnergyLabel");
  if (ep1f) ep1f.style.width = `${Math.min(100, p1e)}%`;
  if (ep2f) ep2f.style.width = `${Math.min(100, p2e)}%`;
  if (ep1l) ep1l.textContent = `⚡ ${Math.min(100, p1e)}%`;
  if (ep2l) ep2l.textContent = `⚡ ${Math.min(100, p2e)}%`;
  // Glow when full
  if (ep1f) ep1f.classList.toggle("full", p1e >= 100);
  if (ep2f) ep2f.classList.toggle("full", p2e >= 100);

  // Name labels
  if (ringP1Name) ringP1Name.textContent = match.p1.name;
  if (ringP2Name) ringP2Name.textContent = match.p2.name;

  const r = match.round || 0;
  if (ringRound) ringRound.textContent = `ROUND ${r || 1}`;
  const t = match.challenge ? match.challenge.type : "—";
  if (ringType) ringType.textContent = t === "—" ? "WAITING…" : `${t.toUpperCase()} RUMBLE`;

  // Ring inline controls
  const rcBadge = document.getElementById("ringChallengeBadge");
  const rcText = document.getElementById("ringChallengeText");
  if (rcBadge) rcBadge.textContent = match.challenge ? match.challenge.type : "—";
  if (rcText) rcText.textContent = match.challenge ? match.challenge.prompt : "Click Next Round to start.";

  // Sync ring move selects with main selects
  syncRingMoves();

  // Sync ring button states with main buttons
  const rn = document.getElementById("ringNext");
  const rr = document.getElementById("ringResolve");
  if (rn) rn.disabled = btnNextRound.disabled;
  if (rr) rr.disabled = btnResolveRound.disabled;
}

function syncRingMoves(){
  if (!match) return;
  const rp1 = document.getElementById("ringP1Move");
  const rp2 = document.getElementById("ringP2Move");
  if (!rp1 || !rp2) return;

  const m1 = MovesByAI[match.p1.ai.id] || [];
  const p1E = match.p1.energy || 0;
  rp1.innerHTML = m1
    .filter(m => !m.isSuper || p1E >= 100)
    .map(m => `<option value="${m.id}">${m.name}</option>`)
    .join("");
  rp1.value = match.p1.moveId || m1[0]?.id || "";

  const m2 = MovesByAI[match.p2.ai.id] || [];
  const p2E = match.p2.energy || 0;
  rp2.innerHTML = m2
    .filter(m => !m.isSuper || p2E >= 100)
    .map(m => `<option value="${m.id}">${m.name}</option>`)
    .join("");
  rp2.value = match.p2.moveId || m2[0]?.id || "";

  // Update ring move labels with player names
  const rl1 = document.getElementById("ringP1MoveLabel");
  const rl2 = document.getElementById("ringP2MoveLabel");
  if (rl1) rl1.textContent = match.p1.name + " Move";
  if (rl2) rl2.textContent = match.p2.name + " Move";
}

function logNarrative(lines){
  const ringLog = document.getElementById("ringLog");
  if (ringLog){
    const html = lines.map(l => `<div class="narrative-line">${l}</div>`).join("");
    ringLog.innerHTML = html;
    ringLog.scrollTop = ringLog.scrollHeight;
  }
}

function showImpact(text){
  if (!impactText) return;
  impactText.textContent = text;
  impactText.classList.remove("show");
  void impactText.offsetWidth; // force reflow
  impactText.classList.add("show");
  setTimeout(()=>impactText.classList.remove("show"), 550);
}

// --- Ring VFX helpers ---
function triggerScreenShake(){
  const ringEl = document.getElementById("ringCanvas");
  if (!ringEl) return;
  ringEl.classList.remove("screen-shake");
  void ringEl.offsetWidth;
  ringEl.classList.add("screen-shake");
  setTimeout(()=> ringEl.classList.remove("screen-shake"), 450);
}

function triggerPowerBurst(colorClass){
  const burst = document.getElementById("powerBurst");
  if (!burst) return;
  burst.className = "power-burst " + (colorClass || "red");
  void burst.offsetWidth;
  burst.classList.add("active");
  setTimeout(()=>{ burst.classList.remove("active"); }, 650);
}

function triggerHitParticles(){
  const p = document.getElementById("hitParticles");
  if (!p) return;
  p.classList.remove("active");
  void p.offsetWidth;
  p.classList.add("active");
  setTimeout(()=> p.classList.remove("active"), 550);
}

function triggerHitFlash(fighterEl){
  if (!fighterEl) return;
  fighterEl.classList.add("hit-flash");
  setTimeout(()=> fighterEl.classList.remove("hit-flash"), 400);
}

function triggerBlockEffect(fighterEl){
  if (!fighterEl) return;
  fighterEl.classList.add("block-effect");
  setTimeout(()=> fighterEl.classList.remove("block-effect"), 550);
}

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
  // Ambient sound: play on home, stop elsewhere
  if (screenKey === "home") { try { SFX?.startAmbient?.(); } catch(e){} }
  else { try { SFX?.stopAmbient?.(); } catch(e){} }
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

// Ring mode refs
const ringStage = el("ringStage");
const btnModeClassic = el("btnModeClassic");
const btnModeRing = el("btnModeRing");
const ringRound = el("ringRound");
const ringType = el("ringType");
const ringP1 = el("ringP1");
const ringP2 = el("ringP2");
const ringP1Name = el("ringP1Name");
const ringP2Name = el("ringP2Name");
const impactText = el("impactText");
const ringP1HudName = el("ringP1HudName");
const ringP2HudName = el("ringP2HudName");
const ringP1HPNum = el("ringP1HPNum");
const ringP2HPNum = el("ringP2HPNum");
const ringP1HPFill = el("ringP1HPFill");
const ringP2HPFill = el("ringP2HPFill");

const arenaGrid = document.querySelector(".arena-grid");

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
  const energy = player.energy || 0;
  selectEl.innerHTML = moves
    .filter(m => !m.isSuper || energy >= 100)
    .map(m => `<option value="${m.id}">${m.name}</option>`).join("");

  if (!player.moveId) player.moveId = moves[0]?.id || null;
  selectEl.value = player.moveId;

  const chosen = getMove(player.ai.id, player.moveId);
  if (chosen) {
    descEl.innerHTML = `<span class="move-desc-text">${chosen.desc}</span>` +
      (chosen.strategy ? `<span class="move-strategy">💡 ${chosen.strategy}</span>` : "");
  } else {
    descEl.textContent = "";
  }
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
  const piercing = !!eff.piercing;
  const reflect = eff.reflect || 0;
  const isSuper = !!(move && move.isSuper);

  const luck = rollD6();
  const total = base + bonus + luck;

  return {
    total, base, bonus, luck, shield, piercing, reflect, isSuper,
    statKey,
    moveName: move ? move.name : "—",
    flavor: move ? move.flavor : ""
  };
}

// Damage tiers (easy to understand)
function baseDamageFromMargin(m){
  if (m <= 2) return 1;
  if (m <= 4) return 2;
  if (m <= 6) return 3;
  return 4;
}

function recommendedMove(aiId, type, energy){
  const moves = MovesByAI[aiId] || [];
  if (!type) return moves.filter(m => !m.isSuper)[0]?.id || moves[0]?.id || null;

  const statKey = TypeToStat[type];
  let best = moves.filter(m => !m.isSuper)[0] || moves[0];
  let bestScore = -999;

  for (const m of moves){
    if (m.isSuper && (energy || 0) < 100) continue;
    const eff = m.effect(type) || {};
    const score = (eff[statKey] || 0) + (eff.shield || 0) * 0.5 + (m.isSuper ? 2 : 0);
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

    syncRingUI();
    return;
  }

  roundCounter.textContent = `Round ${match.round}/${MAX_ROUNDS}`;
  challengeBadge.textContent = match.challenge ? match.challenge.type : "—";
  challengeText.textContent = match.challenge ? match.challenge.prompt : "Click Next Round to start.";

  if (!match.challenge){
    if (p1MoveReco) p1MoveReco.textContent = "";
    if (p2MoveReco) p2MoveReco.textContent = "";

    syncRingUI();
    return;
  }

  const t = match.challenge.type;
  const r1 = recommendedMove(match.p1.ai.id, t, match.p1.energy);
  const r2 = recommendedMove(match.p2.ai.id, t, match.p2.energy);
  const m1 = getMove(match.p1.ai.id, r1);
  const m2 = getMove(match.p2.ai.id, r2);
  if (p1MoveReco) p1MoveReco.textContent = m1 ? `Recommended: ${m1.name}` : "";
  if (p2MoveReco) p2MoveReco.textContent = m2 ? `Recommended: ${m2.name}` : "";

  syncRingUI();
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

// ===== SOUND FX — Full Overhaul =====
const SFX = (() => {
  let enabled = (localStorage.getItem("ai_arena_sound") ?? "on") === "on";
  let ctx = null, comp = null, master = null;
  let ambientOsc = null, ambientGain = null;

  function ensure(){
    if (!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();

      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.knee.value = 20;
      comp.ratio.value = 8;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;

      master = ctx.createGain();
      master.gain.value = 1.0;

      comp.connect(master);
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume().catch(()=>{});
    return ctx;
  }

  function env(g, t0, dur, peak){
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + 0.015);
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

    env(g, now, dur, (opts.vol ?? 0.18));
    o.connect(g); g.connect(comp);
    o.start(now); o.stop(now + dur + 0.03);
  }

  // Noise burst (for impacts)
  function noise(dur = 0.08, vol = 0.15){
    if (!enabled) return;
    const c = ensure();
    if (!c) return;
    const bufferSize = c.sampleRate * dur;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const src = c.createBufferSource();
    src.buffer = buffer;
    const g = c.createGain();
    const now = c.currentTime;
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 800;
    src.connect(hp); hp.connect(g); g.connect(comp);
    src.start(now); src.stop(now + dur + 0.02);
  }

  function setEnabled(v){
    enabled = v;
    localStorage.setItem("ai_arena_sound", enabled ? "on" : "off");
    if (btnSound) btnSound.textContent = `Sound: ${enabled ? "On" : "Off"}`;
    if (!enabled) stopAmbient();
  }

  // ---- Background music system ----
  let bgmInterval = null;
  let bgmNodes = [];

  function startAmbient(){
    if (!enabled) return;
    const c = ensure();
    if (!c || bgmInterval) return;

    // Ambient pad layer (continuous drone)
    ambientGain = c.createGain();
    ambientGain.gain.setValueAtTime(0, c.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.06, c.currentTime + 1.5);

    const o1 = c.createOscillator(); o1.type = "sine"; o1.frequency.value = 55;
    const o2 = c.createOscillator(); o2.type = "sine"; o2.frequency.value = 82.5;
    const o3 = c.createOscillator(); o3.type = "triangle"; o3.frequency.value = 110;
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 280; lp.Q.value = 1;
    o1.connect(lp); o2.connect(lp); o3.connect(lp);
    lp.connect(ambientGain); ambientGain.connect(master);
    o1.start(); o2.start(); o3.start();
    ambientOsc = [o1, o2, o3];

    // Rhythmic beat loop — 8-step pattern at ~125 BPM (480ms per step)
    const stepMs = 480;
    // melody notes (minor pentatonic in E)
    const melody = [164.8, 196, 220, 261.6, 329.6, 261.6, 220, 196];
    const bassLine = [82.4, 82.4, 110, 110, 98, 98, 82.4, 73.4];
    let step = 0;

    function playStep(){
      if (!enabled) return;
      const c2 = ensure();
      if (!c2) return;
      const now = c2.currentTime;

      // Kick drum on beats 0, 4
      if (step % 4 === 0){
        const kick = c2.createOscillator();
        kick.type = "sine";
        kick.frequency.setValueAtTime(150, now);
        kick.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        const kg = c2.createGain();
        kg.gain.setValueAtTime(0.18, now);
        kg.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        kick.connect(kg); kg.connect(comp);
        kick.start(now); kick.stop(now + 0.16);
      }

      // Hi-hat on every step
      const bufLen = c2.sampleRate * 0.04;
      const buf = c2.createBuffer(1, bufLen, c2.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
      const hh = c2.createBufferSource(); hh.buffer = buf;
      const hhg = c2.createGain();
      const hhVol = (step % 2 === 0) ? 0.06 : 0.03;
      hhg.gain.setValueAtTime(hhVol, now);
      hhg.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      const hp = c2.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 6000;
      hh.connect(hp); hp.connect(hhg); hhg.connect(comp);
      hh.start(now); hh.stop(now + 0.05);

      // Melody arp (quiet, atmospheric)
      const mo = c2.createOscillator();
      mo.type = "triangle";
      mo.frequency.setValueAtTime(melody[step % melody.length], now);
      const mg = c2.createGain();
      mg.gain.setValueAtTime(0.07, now);
      mg.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      const mf = c2.createBiquadFilter(); mf.type = "lowpass"; mf.frequency.value = 1200;
      mo.connect(mf); mf.connect(mg); mg.connect(comp);
      mo.start(now); mo.stop(now + 0.38);

      // Bass (on even steps)
      if (step % 2 === 0){
        const bo = c2.createOscillator();
        bo.type = "sawtooth";
        bo.frequency.setValueAtTime(bassLine[step % bassLine.length], now);
        const bg = c2.createGain();
        bg.gain.setValueAtTime(0.10, now);
        bg.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
        const bf = c2.createBiquadFilter(); bf.type = "lowpass"; bf.frequency.value = 300;
        bo.connect(bf); bf.connect(bg); bg.connect(comp);
        bo.start(now); bo.stop(now + 0.32);
      }

      step = (step + 1) % 8;
    }

    // Start the beat loop
    bgmInterval = setInterval(playStep, stepMs);
    // Play first step immediately
    playStep();
  }

  function stopAmbient(){
    if (bgmInterval){
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
    if (ambientOsc){
      if (ambientGain && ctx){
        ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        try { ambientOsc.forEach(o => o.stop()); } catch(e){}
        ambientOsc = null;
        ambientGain = null;
      }, 600);
    }
  }

  return {
    initButton(){
      if (btnSound) btnSound.textContent = `Sound: ${enabled ? "On" : "Off"}`;
    },
    toggle(){ setEnabled(!enabled); },
    startAmbient,
    stopAmbient,

    // UI sounds
    hover(){
      tone(700, 0.025, { type:"triangle", vol:0.08 });
    },
    click(){
      tone(820, 0.04, { type:"square", vol:0.14 });
      tone(1040, 0.025, { type:"square", vol:0.10 });
    },

    // Dice roll
    roll(){
      for (let i = 0; i < 7; i++){
        setTimeout(() => tone(500 + Math.random() * 500, 0.03, { type:"square", vol:0.10 }), i * 50);
      }
      setTimeout(() => tone(1280, 0.09, { type:"triangle", vol:0.16 }), 7 * 50);
    },

    // Round start fanfare
    roundStart(){
      tone(440, 0.08, { type:"triangle", vol:0.18 });
      setTimeout(() => tone(554, 0.08, { type:"triangle", vol:0.18 }), 100);
      setTimeout(() => tone(660, 0.12, { type:"triangle", vol:0.22 }), 200);
    },

    // Hit — punchy bass + noise pop
    hit(){
      tone(180, 0.14, { type:"sine", vol:0.30, slideTo:70 });
      noise(0.06, 0.20);
      setTimeout(() => tone(120, 0.08, { type:"sine", vol:0.15 }), 40);
    },

    // Critical hit — louder, double impact
    crit(){
      tone(200, 0.16, { type:"sawtooth", vol:0.35, slideTo:60 });
      noise(0.10, 0.28);
      setTimeout(() => {
        tone(160, 0.12, { type:"sine", vol:0.25, slideTo:50 });
        noise(0.05, 0.18);
      }, 80);
      setTimeout(() => tone(900, 0.06, { type:"triangle", vol:0.12 }), 160);
    },

    // Super move activation
    superActivate(){
      for (let i = 0; i < 5; i++){
        setTimeout(() => tone(300 + i * 120, 0.06, { type:"sawtooth", vol:0.14 }), i * 60);
      }
      setTimeout(() => {
        tone(880, 0.18, { type:"triangle", vol:0.25 });
        tone(1100, 0.14, { type:"triangle", vol:0.18 });
      }, 320);
    },

    // Block/shield
    block(){
      tone(300, 0.10, { type:"square", vol:0.15 });
      tone(450, 0.08, { type:"triangle", vol:0.12 });
      noise(0.04, 0.10);
    },

    // Combo streak
    combo(streak){
      const baseFreq = 500 + (streak || 1) * 80;
      tone(baseFreq, 0.06, { type:"triangle", vol:0.18 });
      setTimeout(() => tone(baseFreq + 200, 0.08, { type:"triangle", vol:0.20 }), 70);
    },

    // Tie
    tie(){
      tone(420, 0.08, { vol:0.12 });
      tone(400, 0.08, { vol:0.10 });
    },

    // Round win
    win(){
      tone(523, 0.10, { vol:0.20 });
      setTimeout(() => tone(659, 0.10, { vol:0.20 }), 100);
      setTimeout(() => tone(784, 0.14, { vol:0.25 }), 200);
    },

    // Match end — victory fanfare
    matchEnd(){
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => {
        setTimeout(() => tone(f, 0.14, { type:"triangle", vol:0.25 }), i * 120);
      });
      setTimeout(() => {
        tone(1047, 0.3, { type:"triangle", vol:0.30 });
        tone(784, 0.3, { type:"sine", vol:0.15 });
      }, notes.length * 120);
    },
  };
})();

SFX.initButton();
if (btnSound){
  btnSound.addEventListener("click", () => { SFX.click(); SFX.toggle(); });
}

// Resume AudioContext on first user interaction (browsers block autoplay)
let _audioUnlocked = false;
function unlockAudio(){
  if (_audioUnlocked) return;
  _audioUnlocked = true;
  // If we're on the home screen, start BGM
  if (!screens.home.classList.contains("hidden")){
    try { SFX.startAmbient(); } catch(e){}
  }
  document.removeEventListener("click", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
  document.removeEventListener("touchstart", unlockAudio);
}
document.addEventListener("click", unlockAudio);
document.addEventListener("keydown", unlockAudio);
document.addEventListener("touchstart", unlockAudio);

// ===== Ring / Classic mode buttons =====
if (btnModeClassic) btnModeClassic.addEventListener("click", () => { SFX?.click?.(); setMode("classic"); });
if (btnModeRing) btnModeRing.addEventListener("click", () => { SFX?.click?.(); setMode("ring"); });

// Initialize mode on load (safe even if ringStage isn't on screen yet)
setMode(getMode());

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
    p1: { name: name1, ai: a1, hp: MAX_HP, moveId: (MovesByAI[a1.id] || [])[0]?.id || null, energy: 0, combo: 0 },
    p2: { name: name2, ai: a2, hp: MAX_HP, moveId: (MovesByAI[a2.id] || [])[0]?.id || null, energy: 0, combo: 0 },
    challenge: null,
    lastWinner: null
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

  syncRingUI();

  if (roundResult) roundResult.classList.add("hidden");
  if (breakdown) breakdown.classList.add("hidden");
  setDiceVisible(false);

  consoleBox.innerHTML = "";
  logInfo("✅ System ready.");
  logInfo("➡️ Click Next Round to begin.");

  // Reset ring log and result bar
  const rl = document.getElementById("ringLog");
  const rrb = document.getElementById("ringResultBar");
  if (rl) rl.innerHTML = "";
  if (rrb) rrb.textContent = "";

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
  if (m) {
    p1MoveDesc.innerHTML = `<span class="move-desc-text">${m.desc}</span>` +
      (m.strategy ? `<span class="move-strategy">💡 ${m.strategy}</span>` : "");
  } else { p1MoveDesc.textContent = ""; }
  const rp1 = document.getElementById("ringP1Move");
  if (rp1) rp1.value = match.p1.moveId;
  SFX.click();
});
p2MoveSelect.addEventListener("change", () => {
  if (!match) return;
  match.p2.moveId = p2MoveSelect.value;
  const m = getMove(match.p2.ai.id, match.p2.moveId);
  if (m) {
    p2MoveDesc.innerHTML = `<span class="move-desc-text">${m.desc}</span>` +
      (m.strategy ? `<span class="move-strategy">💡 ${m.strategy}</span>` : "");
  } else { p2MoveDesc.textContent = ""; }
  const rp2 = document.getElementById("ringP2Move");
  if (rp2) rp2.value = match.p2.moveId;
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
    match.p1.moveId = recommendedMove(match.p1.ai.id, t, match.p1.energy);
    match.p2.moveId = recommendedMove(match.p2.ai.id, t, match.p2.energy);
  }
  renderMovesUI();

  logInfo(`🎬 Round ${match.round} begins: ${match.challenge.type}`);
  SFX.roundStart();
  updateRoundUI();

  btnResolveRound.disabled = false;
  btnNextRound.disabled = true;
  // Sync ring buttons
  const _rr = document.getElementById("ringResolve");
  const _rn = document.getElementById("ringNext");
  if (_rr) _rr.disabled = false;
  if (_rn) _rn.disabled = true;
});

// Resolve Round
btnResolveRound.addEventListener("click", () => {
  if (!match || !match.challenge) return;

  const type = match.challenge.type;

  const mode = document.body.dataset.mode || "classic";

  // In ring mode, read from ring move selects
  if (mode === "ring") {
    const rp1 = document.getElementById("ringP1Move");
    const rp2 = document.getElementById("ringP2Move");
    if (rp1 && rp1.value) { match.p1.moveId = rp1.value; p1MoveSelect.value = rp1.value; }
    if (rp2 && rp2.value) { match.p2.moveId = rp2.value; p2MoveSelect.value = rp2.value; }
  } else {
    match.p1.moveId = p1MoveSelect.value;
    match.p2.moveId = p2MoveSelect.value;
  }

  const p1Pow = computePower(match.p1, type, match.p1.moveId);
  const p2Pow = computePower(match.p2, type, match.p2.moveId);

  // Dice / Luck
  if (p1DieLabel) p1DieLabel.textContent = `${match.p1.name} Luck`;
  if (p2DieLabel) p2DieLabel.textContent = `${match.p2.name} Luck`;
  SFX.roll();
  animateDice(p1Pow.luck, p2Pow.luck);

  if (roundResult) roundResult.classList.remove("hidden");
  const ringResultBar = document.getElementById("ringResultBar");

  // ===== TIE =====
  if (p1Pow.total === p2Pow.total){
    if (roundResult) roundResult.textContent = `🤝 Round Result: Tie`;
    if (ringResultBar) ringResultBar.textContent = "🤝 TIE — No damage!";
    if (mode === "ring") showImpact("TIE!");

    renderBreakdown({ type, p1: p1Pow, p2: p2Pow, winnerName: "🤝 Tie", dmgLine: "No damage" });

    // Energy gain on tie
    match.p1.energy = Math.min(100, (match.p1.energy || 0) + 10);
    match.p2.energy = Math.min(100, (match.p2.energy || 0) + 10);
    if (p1Pow.isSuper) match.p1.energy = 0;
    if (p2Pow.isSuper) match.p2.energy = 0;

    // Narrative
    logNarrative([
      `⚔️ <b>Round ${match.round}</b> — ${type} Rumble!`,
      `${match.p1.name} uses <b>${p1Pow.moveName}</b> vs ${match.p2.name}'s <b>${p2Pow.moveName}</b>`,
      `🎲 Both score <b>${p1Pow.total}</b> — it's a standoff! No damage dealt.`
    ]);

    logRoundCard({
      round: match.round, type, winnerText: "Tie", dmgText: "0 dmg",
      detailLines: [
        `🎭 ${match.p1.name}: ${p1Pow.moveName} | ${match.p2.name}: ${p2Pow.moveName}`,
        `🎲 Totals tied at <b>${p1Pow.total}</b>. No damage.`
      ]
    });

    SFX.tie();

  // ===== WINNER =====
  } else {
    const winnerKey = p1Pow.total > p2Pow.total ? "p1" : "p2";
    const loserKey  = winnerKey === "p1" ? "p2" : "p1";

    const winnerPow = winnerKey === "p1" ? p1Pow : p2Pow;
    const loserPow  = loserKey === "p1" ? p1Pow : p2Pow;

    const margin = Math.abs(p1Pow.total - p2Pow.total);
    const baseDmg = baseDamageFromMargin(margin);

    // ---- Critical Hit (15% chance, 2x dmg) ----
    const isCrit = Math.random() < 0.15;
    const afterCrit = isCrit ? baseDmg * 2 : baseDmg;

    // ---- Combo Tracking ----
    if (match.lastWinner === winnerKey) {
      match[winnerKey].combo = (match[winnerKey].combo || 0) + 1;
    } else {
      match[winnerKey].combo = 1;
      match[loserKey].combo = 0;
    }
    match.lastWinner = winnerKey;
    const comboBonus = Math.max(0, match[winnerKey].combo - 1);

    // ---- Piercing (ignores shield) ----
    const effectiveShield = winnerPow.piercing ? 0 : loserPow.shield;

    // ---- Final Damage ----
    const finalDmg = Math.max(0, afterCrit + comboBonus - effectiveShield);

    // ---- Reflect Damage (loser's shield bounces dmg back) ----
    const reflectDmg = (!winnerPow.piercing && loserPow.reflect > 0 && effectiveShield > 0) ? loserPow.reflect : 0;

    // ---- Energy Tracking ----
    match[winnerKey].energy = Math.min(100, (match[winnerKey].energy || 0) + 20);
    match[loserKey].energy = Math.min(100, (match[loserKey].energy || 0) + 30);
    if (winnerPow.isSuper) match[winnerKey].energy = 0;
    if (loserPow.isSuper) match[loserKey].energy = 0;

    // --- Full Ring Animation Sequence ---
    if (mode === "ring" && ringP1 && ringP2){
      const attacker = (winnerKey === "p1") ? ringP1 : ringP2;
      const defender = (loserKey === "p1") ? ringP1 : ringP2;
      const winnerAiId = match[winnerKey].ai.id;

      // Clear previous animation classes
      attacker.classList.remove("punch-left","punch-right","recoil","hit-flash","block-effect","super-active");
      defender.classList.remove("punch-left","punch-right","recoil","hit-flash","block-effect","super-active");
      void attacker.offsetWidth;

      // Super move flash
      if (winnerPow.isSuper) {
        attacker.classList.add("super-active");
        SFX.superActivate();
        setTimeout(() => attacker.classList.remove("super-active"), 600);
      }

      // 1) Attacker lunges
      attacker.classList.add(winnerKey === "p1" ? "punch-left" : "punch-right");

      // 2) Impact at ~200ms
      setTimeout(() => {
        triggerPowerBurst(AI_BURST_COLOR[winnerAiId] || "red");
        triggerHitParticles();

        if (finalDmg > 0){
          let impactStr = `-${finalDmg} HP`;
          if (isCrit) impactStr = `CRIT! -${finalDmg}`;
          showImpact(impactStr);
          triggerScreenShake();
          triggerHitFlash(defender);
          if (isCrit) SFX.crit(); else SFX.hit();
          if (comboBonus > 0) setTimeout(() => SFX.combo(match[winnerKey].combo), 150);
        } else {
          showImpact("BLOCKED!");
          triggerBlockEffect(defender);
          SFX.block();
        }

        defender.classList.add("recoil");
      }, 200);

      // Cleanup
      setTimeout(() => {
        attacker.classList.remove("punch-left","punch-right");
        defender.classList.remove("recoil","hit-flash","block-effect");
      }, 700);
    }

    // Apply damage
    match[loserKey].hp -= finalDmg;
    if (reflectDmg > 0) match[winnerKey].hp -= reflectDmg;
    setHP(loserKey, Math.max(0, match[loserKey].hp), MAX_HP);
    if (reflectDmg > 0) setHP(winnerKey, Math.max(0, match[winnerKey].hp), MAX_HP);

    syncRingUI();

    if (roundResult) roundResult.textContent = `🏆 Round Winner: ${match[winnerKey].name}`;
    if (ringResultBar) {
      let barText = `🏆 ${match[winnerKey].name} wins!`;
      if (isCrit) barText += " 💥 CRIT!";
      if (comboBonus > 0) barText += ` 🔥 ${match[winnerKey].combo}x Combo!`;
      barText += finalDmg > 0 ? ` (−${finalDmg} HP)` : " (Blocked!)";
      ringResultBar.textContent = barText;
    }

    const dmgLine = finalDmg === 0
      ? `Blocked! (base ${baseDmg} - shield ${effectiveShield} = 0)`
      : `${finalDmg} dmg (base ${baseDmg}${isCrit?" ×2 crit":""} +${comboBonus} combo - shield ${effectiveShield})`;

    renderBreakdown({
      type, p1: p1Pow, p2: p2Pow,
      winnerName: `🏆 ${match[winnerKey].name}`,
      dmgLine
    });

    // Classic mode visuals
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
      if (mode !== "ring") { isCrit ? SFX.crit() : SFX.hit(); }
      if (comboBonus > 0 && mode !== "ring") setTimeout(() => SFX.combo(match[winnerKey].combo), 150);
      SFX.win();
    } else {
      floatText(loseEl, `Blocked!`);
      if (mode !== "ring") SFX.block();
    }

    // ---- Narrative Combat Log ----
    const narrative = [];
    narrative.push(`⚔️ <b>Round ${match.round}</b> — ${type} Rumble!`);
    if (winnerPow.isSuper) narrative.push(`<span class="super-text">💥 ${match[winnerKey].name} ACTIVATES SUPER MOVE!</span>`);
    narrative.push(`${match[winnerKey].name} uses <b>${winnerPow.moveName}</b>! <i>${winnerPow.flavor}</i>`);
    if (isCrit) narrative.push(`<span class="crit-text">💥 CRITICAL HIT! Double damage!</span>`);
    if (comboBonus > 0) narrative.push(`<span class="combo-text">🔥 ${match[winnerKey].combo}x COMBO! (+${comboBonus} bonus dmg)</span>`);
    if (winnerPow.piercing && loserPow.shield > 0) narrative.push(`⚡ PIERCING! ${match[loserKey].name}'s shield bypassed!`);
    if (finalDmg > 0) narrative.push(`💔 ${match[loserKey].name} takes <b>${finalDmg} damage</b>!`);
    else narrative.push(`🛡️ ${match[loserKey].name} blocks the attack!`);
    if (reflectDmg > 0) narrative.push(`✨ Shield reflects <b>${reflectDmg}</b> damage back to ${match[winnerKey].name}!`);
    logNarrative(narrative);

    logRoundCard({
      round: match.round, type,
      winnerText: `${match[winnerKey].name} wins${isCrit ? " (CRIT!)" : ""}${comboBonus > 0 ? ` (${match[winnerKey].combo}x combo)` : ""}`,
      dmgText: finalDmg === 0 ? "Blocked" : `-${finalDmg} HP`,
      detailLines: [
        `🎭 ${match.p1.name}: <b>${p1Pow.moveName}</b> | ${match.p2.name}: <b>${p2Pow.moveName}</b>`,
        `🎲 Luck: ${match.p1.name} <b>${p1Pow.luck}</b>, ${match.p2.name} <b>${p2Pow.luck}</b>`,
        `📊 Totals: ${match.p1.name} <b>${p1Pow.total}</b> vs ${match.p2.name} <b>${p2Pow.total}</b> (margin ${margin})`,
        `💥 Dmg: ${baseDmg}${isCrit?" ×2 CRIT":""}${comboBonus>0?` +${comboBonus} combo`:""} − ${effectiveShield} shield = <b>${finalDmg}</b>`,
        reflectDmg > 0 ? `✨ Reflect: ${reflectDmg} back to ${match[winnerKey].name}` : null
      ].filter(Boolean)
    });
  }

  // ---- End checks ----
  if (match.p1.hp <= 0 || match.p2.hp <= 0){
    const champ = match.p1.hp <= 0 ? match.p2.name : match.p1.name;
    logInfo(`🏁 MATCH END — Winner: ${champ}`);
    if (ringResultBar) ringResultBar.textContent = `🏁 ${champ} WINS THE MATCH!`;
    logNarrative([`🏁 <b style="font-size:14px;color:#ffd644">MATCH OVER!</b>`, `🏆 <b>${champ}</b> is victorious!`]);
    SFX.matchEnd();
    btnResolveRound.disabled = true;
    btnNextRound.disabled = true;
    syncRingUI();
    return;
  }

  if (match.round >= MAX_ROUNDS){
    let endResult;
    if (match.p1.hp === match.p2.hp) {
      endResult = "Draw!";
      logInfo("🏁 MATCH END — Draw!");
      logNarrative([`🏁 <b style="font-size:14px;color:#ffd644">MATCH OVER!</b>`, `🤝 It's a <b>DRAW</b>!`]);
    } else {
      const w = match.p1.hp > match.p2.hp ? match.p1.name : match.p2.name;
      endResult = w;
      logInfo(`🏁 MATCH END — Winner: ${w}`);
      logNarrative([`🏁 <b style="font-size:14px;color:#ffd644">MATCH OVER!</b>`, `🏆 <b>${w}</b> is victorious!`]);
    }
    if (ringResultBar) ringResultBar.textContent = `🏁 ${endResult}`;
    SFX.matchEnd();
    btnResolveRound.disabled = true;
    btnNextRound.disabled = true;
    syncRingUI();
    return;
  }

  btnResolveRound.disabled = true;
  btnNextRound.disabled = false;
  match.challenge = null;
  updateRoundUI();

  // Auto-scroll ring into view
  if (mode === "ring" && ringStage) {
    setTimeout(() => ringStage.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
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

// ===== Ring Controls Wiring =====
(function wireRingControls(){
  const ringNext = document.getElementById("ringNext");
  const ringResolve = document.getElementById("ringResolve");
  const ringP1Move = document.getElementById("ringP1Move");
  const ringP2Move = document.getElementById("ringP2Move");

  if (ringNext) ringNext.addEventListener("click", () => {
    SFX?.click?.();
    btnNextRound.click();
  });
  if (ringResolve) ringResolve.addEventListener("click", () => {
    SFX?.click?.();
    btnResolveRound.click();
  });

  if (ringP1Move) ringP1Move.addEventListener("change", () => {
    if (!match) return;
    match.p1.moveId = ringP1Move.value;
    p1MoveSelect.value = ringP1Move.value;
    const m = getMove(match.p1.ai.id, match.p1.moveId);
    if (m) {
      p1MoveDesc.innerHTML = `<span class="move-desc-text">${m.desc}</span>` +
        (m.strategy ? `<span class="move-strategy">💡 ${m.strategy}</span>` : "");
    } else { p1MoveDesc.textContent = ""; }
    SFX.click();
  });

  if (ringP2Move) ringP2Move.addEventListener("change", () => {
    if (!match) return;
    match.p2.moveId = ringP2Move.value;
    p2MoveSelect.value = ringP2Move.value;
    const m = getMove(match.p2.ai.id, match.p2.moveId);
    if (m) {
      p2MoveDesc.innerHTML = `<span class="move-desc-text">${m.desc}</span>` +
        (m.strategy ? `<span class="move-strategy">💡 ${m.strategy}</span>` : "");
    } else { p2MoveDesc.textContent = ""; }
    SFX.click();
  });
})();

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

  // update avatar logos
  p1.querySelector(".avatar").innerHTML = AI_LOGOS[a1.id] || a1.name[0];
  p2.querySelector(".avatar").innerHTML = AI_LOGOS[a2.id] || a2.name[0];

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

    // Avatar logos
    p1.querySelector(".avatar").innerHTML = AI_LOGOS[a1.id] || a1.name[0];
    p2.querySelector(".avatar").innerHTML = AI_LOGOS[a2.id] || a2.name[0];

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
            <div class="roster-avatar">${AI_LOGOS[ai.id] || ai.name[0]}</div>
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