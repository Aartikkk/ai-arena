// Step 2: UI-only skeleton (no combat yet)

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

const el = (id) => document.getElementById(id);

const screens = {
  home: el("screenHome"),
  select: el("screenSelect"),
  arena: el("screenArena")
};

function show(screenKey){
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screens[screenKey].classList.remove("hidden");
}

function fillSelect(selectEl){
  selectEl.innerHTML = AIs.map(ai => `<option value="${ai.id}">${ai.name}</option>`).join("");
}

function getAI(id){ return AIs.find(a => a.id === id); }

function renderPreview(targetEl, ai){
  const s = ai.stats;
  targetEl.innerHTML = `
    <div><strong>${ai.name}</strong> — ${ai.flavor}</div>
    <div class="hint" style="margin-top:8px;">
      Stats: CODE ${s.code} · WRITING ${s.writing} · RESEARCH ${s.research} · LOGIC ${s.logic} · CREATIVITY ${s.creativity} · SPEED ${s.speed}
    </div>
  `;
}

// DOM refs
const p1Select = el("p1Select");
const p2Select = el("p2Select");
const p1Preview = el("p1Preview");
const p2Preview = el("p2Preview");
const p1Name = el("p1Name");
const p2Name = el("p2Name");

const p1Status = el("p1Status");
const p2Status = el("p2Status");

// Buttons
el("btnGoSelect").addEventListener("click", () => show("select"));
el("btnBackHome").addEventListener("click", () => show("home"));
el("btnBackSelect").addEventListener("click", () => show("select"));
el("btnHome").addEventListener("click", () => show("home"));
el("btnReset").addEventListener("click", () => show("home"));

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

el("btnStartGame").addEventListener("click", () => {
  const a1 = getAI(p1Select.value);
  const a2 = getAI(p2Select.value);

  const name1 = p1Name.value || "Team 1";
  const name2 = p2Name.value || "Team 2";

  // Fill arena cards
  el("p1CardName").textContent = name1;
  el("p1CardAI").textContent = a1.name;
  el("p2CardName").textContent = name2;
  el("p2CardAI").textContent = a2.name;

  renderStats("p1Stats", a1.stats);
  renderStats("p2Stats", a2.stats);

  // HP placeholder for now (combat later)
  setHP("p1", 12, 12);
  setHP("p2", 12, 12);

  show("arena");
});

// init
fillSelect(p1Select);
fillSelect(p2Select);

p1Select.value = "chatgpt";
p2Select.value = "claude";

renderPreview(p1Preview, getAI(p1Select.value));
renderPreview(p2Preview, getAI(p2Select.value));

p1Select.addEventListener("change", () => renderPreview(p1Preview, getAI(p1Select.value)));
p2Select.addEventListener("change", () => renderPreview(p2Preview, getAI(p2Select.value)));

show("home");