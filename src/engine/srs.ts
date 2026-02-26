import { getAllCombos, type Combo } from '../data/ranges';

export type CardState = {
  hand: string;
  position: string;
  // SRS fields
  interval: number;    // how many reviews before this card comes back (1 = next review)
  ease: number;        // ease factor (starts at 2.5)
  repetitions: number; // consecutive correct answers
  due: number;         // "virtual timestamp" — lower = due sooner
  lastSeen: number;
};

const STORAGE_KEY = 'poker-srs-state';
const STATS_KEY = 'poker-srs-stats';

export type Stats = {
  totalReviews: number;
  correctReviews: number;
  currentStreak: number;
  bestStreak: number;
};

function defaultStats(): Stats {
  return { totalReviews: 0, correctReviews: 0, currentStreak: 0, bestStreak: 0 };
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return defaultStats();
}

function saveStats(s: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(s));
}

export function getStats(): Stats {
  return loadStats();
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STATS_KEY);
}

// ---- Deck management ----

function comboKey(c: Combo) {
  return `${c.hand}|${c.position}`;
}

function loadDeck(): Map<string, CardState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr: CardState[] = JSON.parse(raw);
      const map = new Map<string, CardState>();
      for (const cs of arr) {
        map.set(`${cs.hand}|${cs.position}`, cs);
      }
      return map;
    }
  } catch { /* ignore */ }
  return new Map();
}

function saveDeck(deck: Map<string, CardState>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...deck.values()]));
}

let deck: Map<string, CardState> | null = null;
let clock = 0; // virtual clock that increments each review

function ensureDeck(): Map<string, CardState> {
  if (deck) return deck;
  deck = loadDeck();

  // Ensure every combo exists in the deck
  const combos = getAllCombos();
  for (const c of combos) {
    const key = comboKey(c);
    if (!deck.has(key)) {
      deck.set(key, {
        hand: c.hand,
        position: c.position,
        interval: 0,
        ease: 2.5,
        repetitions: 0,
        due: 0,
        lastSeen: -1,
      });
    }
  }

  // Set virtual clock to max due value
  for (const cs of deck.values()) {
    if (cs.due > clock) clock = cs.due;
    if (cs.lastSeen >= clock) clock = cs.lastSeen + 1;
  }

  return deck;
}

// Pick the next card to review
// Priority: cards that are due (due <= clock), sorted by due ascending.
// If no card is due, pick the card with the lowest due value (earliest scheduled).
// To avoid monotony, add slight randomness among equally-due cards.
export function getNextCard(): CardState {
  const d = ensureDeck();
  const cards = [...d.values()];

  // Separate due and not-yet-due
  const dueCards = cards.filter((c) => c.due <= clock);

  let pool: CardState[];
  if (dueCards.length > 0) {
    // Sort by due ascending (most overdue first)
    dueCards.sort((a, b) => a.due - b.due);
    // Take the top batch that share the same due value (add randomness within batch)
    const minDue = dueCards[0].due;
    pool = dueCards.filter((c) => c.due <= minDue + 2);
  } else {
    // Nothing is due yet — pick from least-due
    cards.sort((a, b) => a.due - b.due);
    const minDue = cards[0].due;
    pool = cards.filter((c) => c.due <= minDue + 2);
  }

  // Random pick within pool
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

// Record answer: correct or incorrect
export function recordAnswer(hand: string, position: string, correct: boolean) {
  const d = ensureDeck();
  const key = `${hand}|${position}`;
  const card = d.get(key);
  if (!card) return;

  clock++;

  // Update stats
  const stats = loadStats();
  stats.totalReviews++;
  if (correct) {
    stats.correctReviews++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
  } else {
    stats.currentStreak = 0;
  }
  saveStats(stats);

  // SM-2 inspired algorithm
  if (correct) {
    card.repetitions++;
    if (card.repetitions === 1) {
      card.interval = 1;
    } else if (card.repetitions === 2) {
      card.interval = 3;
    } else {
      card.interval = Math.round(card.interval * card.ease);
    }
    card.ease = Math.max(1.3, card.ease + 0.1);
  } else {
    // Wrong — reset, come back soon
    card.repetitions = 0;
    card.interval = 0;
    card.ease = Math.max(1.3, card.ease - 0.3);
  }

  card.due = clock + card.interval;
  card.lastSeen = clock;

  d.set(key, card);
  saveDeck(d);
}

// Mastery: a card is "mastered" if repetitions >= 3
export function getMasteryPercent(): number {
  const d = ensureDeck();
  const cards = [...d.values()];
  const mastered = cards.filter((c) => c.repetitions >= 3).length;
  return Math.round((mastered / cards.length) * 100);
}

// Force-reload deck from localStorage (useful after reset)
export function reloadDeck() {
  deck = null;
  clock = 0;
}
