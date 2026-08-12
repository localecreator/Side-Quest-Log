// Quest Log — gamified daily tracker
// All data is stored in the browser's localStorage. Nothing leaves your device.

const STORAGE_KEY = 'questlog_state_v1';
const RING_CIRCUMFERENCE = 327; // 2 * PI * 52

const defaultState = {
  totalXp: 0,
  level: 1,
  currentXp: 0,       // xp progress toward next level
  xpToNextLevel: 100,
  streak: 0,
  lastActiveDate: null, // YYYY-MM-DD of the last day a quest was completed
  quests: []           // { id, name, tier, xp, completed }
};

let state = loadState();
let selectedTier = { tier: 'small', xp: 5 };

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed };
  } catch (e) {
    console.error('Quest Log: failed to load state', e);
    return structuredClone(defaultState);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Quest Log: failed to save state', e);
  }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

// Clear completed quests from a previous day, keep incomplete ones, adjust streak
function handleDailyRollover() {
  const today = todayStr();
  if (!state.lastActiveDate) {
    state.lastActiveDate = today;
    saveState();
    return;
  }
  if (state.lastActiveDate === today) return; // same day, nothing to do

  const gap = daysBetween(state.lastActiveDate, today);

  // Streak logic: if exactly 1 day passed since last completion, streak continues.
  // If more than 1 day passed with no completions, streak resets.
  if (gap > 1) {
    state.streak = 0;
  }

  // Remove completed quests, keep incomplete ones for today
  state.quests = state.quests.filter(q => !q.completed);
  state.lastActiveDate = today;
  saveState();
}

function xpForLevel(level) {
  // Each level requires a bit more XP than the last
  return Math.round(100 * Math.pow(1.15, level - 1));
}

function addXp(amount) {
  state.totalXp += amount;
  state.currentXp += amount;

  while (state.currentXp >= state.xpToNextLevel) {
    state.currentXp -= state.xpToNextLevel;
    state.level += 1;
    state.xpToNextLevel = xpForLevel(state.level);
    showToast(`Level up! You're now level ${state.level}`);
  }
}

function registerCompletionForStreak() {
  const today = todayStr();
  const hasCompletionToday = state.quests.some(q => q.completed);
  if (hasCompletionToday && state.lastStreakDate !== today) {
    state.streak += 1;
    state.lastStreakDate = today;
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function render() {
  document.getElementById('levelNum').textContent = state.level;
  document.getElementById('xpCurrent').textContent = state.currentXp;
  document.getElementById('xpNeeded').textContent = state.xpToNextLevel;
  document.getElementById('totalXp').textContent = state.totalXp;
  document.getElementById('streakCount').textContent = state.streak;
  document.getElementById('questsToday').textContent =
    state.quests.filter(q => q.completed).length;

  const pct = Math.min(1, state.currentXp / state.xpToNextLevel);
  const offset = RING_CIRCUMFERENCE * (1 - pct);
  document.getElementById('ringFg').style.strokeDashoffset = offset;

  const list = document.getElementById('questList');
  const emptyState = document.getElementById('emptyState');
  list.innerHTML = '';

  if (state.quests.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    state.quests
      .slice()
      .sort((a, b) => a.completed - b.completed)
      .forEach(q => list.appendChild(renderQuestItem(q)));
  }
}

function renderQuestItem(q) {
  const item = document.createElement('div');
  item.className = 'quest-item' + (q.completed ? ' completed' : '');
  item.dataset.tier = q.tier;

  const check = document.createElement('button');
  check.className = 'quest-check' + (q.completed ? ' checked' : '');
  check.textContent = q.completed ? '✓' : '';
  check.setAttribute('aria-label', q.completed ? 'Mark incomplete' : 'Mark complete');
  check.addEventListener('click', () => toggleQuest(q.id));

  const name = document.createElement('span');
  name.className = 'quest-name';
  name.textContent = q.name;

  const xp = document.createElement('span');
  xp.className = 'quest-xp';
  xp.textContent = `+${q.xp}xp`;

  const del = document.createElement('button');
  del.className = 'quest-del';
  del.textContent = '✕';
  del.setAttribute('aria-label', 'Delete quest');
  del.addEventListener('click', () => deleteQuest(q.id));

  item.append(check, name, xp, del);
  return item;
}

function toggleQuest(id) {
  const q = state.quests.find(q => q.id === id);
  if (!q) return;

  q.completed = !q.completed;

  if (q.completed) {
    addXp(q.xp);
    registerCompletionForStreak();
    showToast(`Quest complete: +${q.xp}xp`);
  } else {
    // Undo XP if unchecked
    state.totalXp = Math.max(0, state.totalXp - q.xp);
    state.currentXp = Math.max(0, state.currentXp - q.xp);
  }

  saveState();
  render();
}

function deleteQuest(id) {
  state.quests = state.quests.filter(q => q.id !== id);
  saveState();
  render();
}

function addQuest() {
  const input = document.getElementById('questInput');
  const name = input.value.trim();
  if (!name) return;

  state.quests.push({
    id: uid(),
    name,
    tier: selectedTier.tier,
    xp: selectedTier.xp,
    completed: false
  });

  input.value = '';
  saveState();
  render();
}

function resetAll() {
  if (!confirm('This clears all quests, XP, and streak data. Continue?')) return;
  state = structuredClone(defaultState);
  state.lastActiveDate = todayStr();
  saveState();
  render();
}

// --- Event wiring ---
document.querySelectorAll('.tier-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedTier = { tier: btn.dataset.tier, xp: parseInt(btn.dataset.xp, 10) };
  });
});

document.getElementById('addBtn').addEventListener('click', addQuest);
document.getElementById('questInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addQuest();
});
document.getElementById('resetBtn').addEventListener('click', resetAll);

// --- Init ---
handleDailyRollover();
render();
