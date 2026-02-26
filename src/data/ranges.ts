export type Position = 'UTG' | 'Middle' | 'Cutoff' | 'Blinds';
export type Action = 'Fold' | 'Raise' | 'Call' | '3-Bet';

// Some hands accept multiple correct answers (e.g. Raise OR 3-Bet at Blinds)
export type RangeEntry = {
  hand: string;
  actions: Record<Position, Action[]>;
};

const RANGES: RangeEntry[] = [
  // --- Premium pairs ---
  {
    hand: 'AA',
    actions: {
      UTG: ['Raise'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise', '3-Bet'],
    },
  },
  {
    hand: 'KK',
    actions: {
      UTG: ['Raise'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise', '3-Bet'],
    },
  },
  {
    hand: 'QQ',
    actions: {
      UTG: ['Raise'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise', '3-Bet'],
    },
  },
  {
    hand: 'JJ',
    actions: {
      UTG: ['Raise'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise', '3-Bet'],
    },
  },

  // --- Medium pairs ---
  {
    hand: 'TT',
    actions: {
      UTG: ['Raise'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise'],
    },
  },
  {
    hand: '99',
    actions: {
      UTG: ['Raise'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise'],
    },
  },

  // --- Small-medium pairs ---
  {
    hand: '88',
    actions: {
      UTG: ['Fold'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise'],
    },
  },
  {
    hand: '77',
    actions: {
      UTG: ['Fold'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise'],
    },
  },

  // --- Small pairs ---
  ...['66', '55', '44', '33', '22'].map((hand) => ({
    hand,
    actions: {
      UTG: ['Fold'] as Action[],
      Middle: ['Fold'] as Action[],
      Cutoff: ['Raise'] as Action[],
      Blinds: ['Call'] as Action[],
    },
  })),

  // --- AK, AQs ---
  {
    hand: 'AKs',
    actions: {
      UTG: ['Raise'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['3-Bet'],
    },
  },
  {
    hand: 'AKo',
    actions: {
      UTG: ['Raise'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['3-Bet'],
    },
  },
  {
    hand: 'AQs',
    actions: {
      UTG: ['Raise'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['3-Bet'],
    },
  },

  // --- AQo, AJs, ATs ---
  {
    hand: 'AQo',
    actions: {
      UTG: ['Fold'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise'],
    },
  },
  {
    hand: 'AJs',
    actions: {
      UTG: ['Fold'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise'],
    },
  },
  {
    hand: 'ATs',
    actions: {
      UTG: ['Fold'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise'],
    },
  },

  // --- KQs, KJs ---
  {
    hand: 'KQs',
    actions: {
      UTG: ['Fold'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise'],
    },
  },
  {
    hand: 'KJs',
    actions: {
      UTG: ['Fold'], Middle: ['Raise'], Cutoff: ['Raise'], Blinds: ['Raise'],
    },
  },

  // --- Suited aces A9s-A2s ---
  ...['A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s'].map((hand) => ({
    hand,
    actions: {
      UTG: ['Fold'] as Action[],
      Middle: ['Fold'] as Action[],
      Cutoff: ['Raise'] as Action[],
      Blinds: ['Call'] as Action[],
    },
  })),

  // --- Suited connectors ---
  ...['JTs', 'T9s', '98s'].map((hand) => ({
    hand,
    actions: {
      UTG: ['Fold'] as Action[],
      Middle: ['Fold'] as Action[],
      Cutoff: ['Raise'] as Action[],
      Blinds: ['Call'] as Action[],
    },
  })),
];

export default RANGES;

// Build a flat list of all [hand, position] combos for the SRS
export type Combo = { hand: string; position: Position };

export function getAllCombos(): Combo[] {
  const combos: Combo[] = [];
  const positions: Position[] = ['UTG', 'Middle', 'Cutoff', 'Blinds'];
  for (const entry of RANGES) {
    for (const pos of positions) {
      combos.push({ hand: entry.hand, position: pos });
    }
  }
  return combos;
}

export function getCorrectActions(hand: string, position: Position): Action[] {
  const entry = RANGES.find((r) => r.hand === hand);
  if (!entry) return ['Fold'];
  return entry.actions[position];
}
