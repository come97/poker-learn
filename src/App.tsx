import { useState, useEffect, useCallback } from 'react';
import { getCorrectActions, type Action, type Position } from './data/ranges';
import {
  getNextCard,
  recordAnswer,
  getMasteryPercent,
  getStats,
  resetProgress,
  reloadDeck,
  type CardState,
  type Stats,
} from './engine/srs';

const ACTIONS: Action[] = ['Fold', 'Call', 'Raise', '3-Bet'];

const ACTION_COLORS: Record<Action, { bg: string; hover: string; ring: string }> = {
  Fold:    { bg: 'bg-red-600',    hover: 'hover:bg-red-500',    ring: 'ring-red-400' },
  Call:    { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-400', ring: 'ring-yellow-300' },
  Raise:   { bg: 'bg-green-600',  hover: 'hover:bg-green-500',  ring: 'ring-green-400' },
  '3-Bet': { bg: 'bg-blue-600',   hover: 'hover:bg-blue-500',   ring: 'ring-blue-400' },
};

const POSITION_LABELS: Record<Position, string> = {
  UTG: 'UTG / Early',
  Middle: 'Middle Position',
  Cutoff: 'Cutoff / Bouton',
  Blinds: 'Blinds (SB/BB)',
};

const SUIT_SYMBOLS: Record<string, string> = {
  s: '♠', o: '♦', '': '',
};

function formatHand(hand: string) {
  const suffix = hand.endsWith('s') ? 's' : hand.endsWith('o') ? 'o' : '';
  const base = suffix ? hand.slice(0, -1) : hand;
  return { base, suffix: SUIT_SYMBOLS[suffix], isSuited: suffix === 's' };
}

function App() {
  const [card, setCard] = useState<CardState | null>(null);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    chosen: Action;
    expected: Action[];
  } | null>(null);
  const [mastery, setMastery] = useState(0);
  const [stats, setStats] = useState<Stats>(getStats());
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const drawCard = useCallback(() => {
    setFeedback(null);
    setCard(getNextCard());
    setMastery(getMasteryPercent());
    setStats(getStats());
  }, []);

  useEffect(() => {
    drawCard();
  }, [drawCard]);

  const handleAction = (action: Action) => {
    if (!card || feedback) return;
    const expected = getCorrectActions(card.hand, card.position as Position);
    const correct = expected.includes(action);
    recordAnswer(card.hand, card.position, correct);
    setFeedback({ correct, chosen: action, expected });
    setStats(getStats());
    setMastery(getMasteryPercent());
  };

  const handleReset = () => {
    resetProgress();
    reloadDeck();
    setShowConfirmReset(false);
    drawCard();
  };

  if (!card) return null;

  const { base, suffix, isSuited } = formatHand(card.hand);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 text-white flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Header — compact on mobile */}
      <header className="text-center pt-4 sm:pt-6 pb-1 sm:pb-2 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          <span className="text-emerald-400">♠</span> Poker Range Trainer <span className="text-red-400">♦</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Mémorise tes ranges d'ouverture préflop</p>
      </header>

      {/* Dashboard */}
      <div className="mx-auto w-full max-w-xl px-3 sm:px-4 mt-2 sm:mt-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          <div className="bg-gray-800/60 backdrop-blur rounded-xl p-2 sm:p-3 border border-gray-700/50">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">{mastery}%</div>
            <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Ranges maîtrisés</div>
          </div>
          <div className="bg-gray-800/60 backdrop-blur rounded-xl p-2 sm:p-3 border border-gray-700/50">
            <div className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.currentStreak}</div>
            <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Série en cours</div>
          </div>
          <div className="bg-gray-800/60 backdrop-blur rounded-xl p-2 sm:p-3 border border-gray-700/50">
            <div className="text-xl sm:text-2xl font-bold text-blue-400">
              {stats.totalReviews > 0
                ? Math.round((stats.correctReviews / stats.totalReviews) * 100)
                : 0}%
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Précision globale</div>
          </div>
        </div>

        {/* Mastery progress bar */}
        <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-500"
            style={{ width: `${mastery}%` }}
          />
        </div>
      </div>

      {/* Main card — fills remaining space */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-3 sm:py-6">
        <div className="relative w-full max-w-md">
          {/* The card */}
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl p-5 sm:p-8 text-center">
            {/* Position badge */}
            <div className="inline-block bg-emerald-600/20 border border-emerald-500/30 rounded-full px-3 sm:px-4 py-1 mb-4 sm:mb-6">
              <span className="text-emerald-300 text-xs sm:text-sm font-medium tracking-wide">
                {POSITION_LABELS[card.position as Position]}
              </span>
            </div>

            {/* Hand display */}
            <div className="mb-5 sm:mb-8">
              <div className="text-6xl sm:text-7xl font-black tracking-wider select-none">
                {base}
                {suffix && (
                  <span className={isSuited ? 'text-emerald-400' : 'text-red-400'}>
                    {suffix}
                  </span>
                )}
              </div>
              {suffix && (
                <div className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">
                  {isSuited ? 'Suited' : 'Offsuit'}
                </div>
              )}
            </div>

            {/* Action buttons — large touch targets (min 48px) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {ACTIONS.map((action) => {
                const c = ACTION_COLORS[action];
                return (
                  <button
                    key={action}
                    onClick={() => handleAction(action)}
                    disabled={!!feedback}
                    className={`${c.bg} ${c.hover} text-white font-bold min-h-[52px] sm:min-h-[56px] py-3 sm:py-4 rounded-xl text-base sm:text-lg
                      transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 ${c.ring}
                      disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none`}
                  >
                    {action}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback overlay */}
          {feedback && (
            <div
              className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm px-4
                ${feedback.correct
                  ? 'bg-emerald-900/80 border-2 border-emerald-400'
                  : 'bg-red-900/80 border-2 border-red-400'
                }`}
            >
              <div className="text-5xl sm:text-6xl mb-2 sm:mb-3">
                {feedback.correct ? '✓' : '✗'}
              </div>
              <div className={`text-xl sm:text-2xl font-bold mb-1 sm:mb-2 ${feedback.correct ? 'text-emerald-300' : 'text-red-300'}`}>
                {feedback.correct ? 'Correct !' : 'Incorrect'}
              </div>
              {!feedback.correct && (
                <div className="text-gray-200 text-sm sm:text-base mb-1">
                  Réponse attendue : <span className="font-bold">{feedback.expected.join(' / ')}</span>
                </div>
              )}
              <div className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                Ta réponse : {feedback.chosen}
              </div>
              <button
                onClick={drawCard}
                className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-bold py-3 px-8 rounded-xl
                  transition-all duration-150 active:scale-95 focus:outline-none cursor-pointer min-h-[48px] select-none"
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer — compact */}
      <footer className="text-center py-2 sm:py-4 text-gray-500 text-[10px] sm:text-xs space-y-0.5 sm:space-y-1 px-4">
        <div>
          {stats.totalReviews} réponses · Meilleure série : {stats.bestStreak}
        </div>
        <button
          onClick={() => setShowConfirmReset(true)}
          className="text-gray-600 hover:text-gray-400 underline text-[10px] sm:text-xs cursor-pointer bg-transparent border-none"
        >
          Réinitialiser la progression
        </button>
      </footer>

      {/* Reset confirmation modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-2xl p-5 sm:p-6 w-full max-w-sm border border-gray-700">
            <h3 className="text-lg font-bold mb-2">Réinitialiser ?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Toute ta progression sera effacée. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg cursor-pointer min-h-[44px]"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg cursor-pointer min-h-[44px]"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
