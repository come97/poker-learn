import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import HandDisplay from './components/HandDisplay';
import CheatSheet from './components/CheatSheet';

const ACTIONS: Action[] = ['Fold', 'Call', 'Raise', '3-Bet'];

const ACTION_STYLES: Record<Action, { bg: string; glow: string; icon: string }> = {
  Fold:    { bg: 'from-red-600 to-red-700',       glow: 'shadow-red-600/25',    icon: '✕' },
  Call:    { bg: 'from-yellow-500 to-amber-600',   glow: 'shadow-yellow-500/25', icon: '☎' },
  Raise:   { bg: 'from-green-500 to-emerald-600',  glow: 'shadow-green-500/25',  icon: '↑' },
  '3-Bet': { bg: 'from-blue-500 to-indigo-600',    glow: 'shadow-blue-500/25',   icon: '⚡' },
};

const POSITION_LABELS: Record<Position, { label: string; sub: string }> = {
  UTG:    { label: 'UTG', sub: 'Early Position' },
  Middle: { label: 'MP', sub: 'Middle Position' },
  Cutoff: { label: 'CO/BTN', sub: 'Cutoff / Bouton' },
  Blinds: { label: 'SB/BB', sub: 'Blinds' },
};

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
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const drawCard = useCallback(() => {
    setFeedback(null);
    setCard(getNextCard());
    setMastery(getMasteryPercent());
    setStats(getStats());
    setCardKey((k) => k + 1);
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

  const pos = POSITION_LABELS[card.position as Position];

  return (
    <div className="min-h-[100dvh] bg-gray-950 text-white flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-hidden relative">
      {/* Background — casino felt */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-[#0c1a0f] to-gray-950 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-[100dvh]">

        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="text-emerald-400">♠</span> Range Trainer
            </h1>
            <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">Répétition espacée</p>
          </div>
          <button
            onClick={() => setShowCheatSheet(true)}
            className="bg-gray-800/80 hover:bg-gray-700/80 active:bg-gray-600/80 border border-gray-700/50
              text-gray-300 text-xs font-medium px-3 py-2 rounded-xl transition-all cursor-pointer
              hover:border-gray-600/60 active:scale-95"
          >
            Antisèche
          </button>
        </header>

        {/* Dashboard */}
        <div className="px-3 sm:px-6 mt-2 sm:mt-3">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-gray-800/40 rounded-xl p-2.5 sm:p-3 border border-gray-700/30 text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">{mastery}%</div>
              <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium mt-0.5 uppercase tracking-wide">Maîtrise</div>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-2.5 sm:p-3 border border-gray-700/30 text-center">
              <div className="text-xl sm:text-2xl font-black text-yellow-400">{stats.currentStreak}</div>
              <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium mt-0.5 uppercase tracking-wide">Série</div>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-2.5 sm:p-3 border border-gray-700/30 text-center">
              <div className="text-xl sm:text-2xl font-black text-blue-400">
                {stats.totalReviews > 0 ? Math.round((stats.correctReviews / stats.totalReviews) * 100) : 0}%
              </div>
              <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium mt-0.5 uppercase tracking-wide">Précision</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"
              initial={false}
              animate={{ width: `${mastery}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-8">
          <div className="relative w-full max-w-sm">

            {/* Position badge */}
            <motion.div
              key={`pos-${cardKey}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-center mb-4 sm:mb-6"
            >
              <div className="inline-flex items-center gap-2 bg-emerald-600/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
                <span className="text-emerald-400 font-bold text-sm sm:text-base">{pos.label}</span>
                <span className="text-emerald-500/50">|</span>
                <span className="text-emerald-300/70 text-xs sm:text-sm">{pos.sub}</span>
              </div>
            </motion.div>

            {/* Cards display */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <HandDisplay hand={card.hand} animationKey={`hand-${cardKey}`} />
            </div>

            {/* Action buttons */}
            <motion.div
              key={`btns-${cardKey}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 gap-2.5 sm:gap-3"
            >
              {ACTIONS.map((action) => {
                const s = ACTION_STYLES[action];
                return (
                  <motion.button
                    key={action}
                    onClick={() => handleAction(action)}
                    disabled={!!feedback}
                    whileTap={{ scale: 0.93 }}
                    className={`bg-gradient-to-b ${s.bg} text-white font-bold min-h-[56px] sm:min-h-[60px]
                      rounded-xl text-base sm:text-lg shadow-lg ${s.glow}
                      transition-all duration-150 focus:outline-none
                      disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer select-none
                      border border-white/10 hover:border-white/20
                      hover:brightness-110 active:brightness-90`}
                  >
                    <span className="mr-1.5 opacity-70">{s.icon}</span>
                    {action}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Feedback overlay */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`absolute -inset-3 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md
                    ${feedback.correct
                      ? 'bg-emerald-950/90 border-2 border-emerald-400/60'
                      : 'bg-red-950/90 border-2 border-red-400/60'
                    }`}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 sm:mb-4
                      ${feedback.correct
                        ? 'bg-emerald-500/20 border-2 border-emerald-400/40'
                        : 'bg-red-500/20 border-2 border-red-400/40'
                      }`}
                  >
                    <span className="text-3xl sm:text-4xl">
                      {feedback.correct ? '✓' : '✗'}
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className={`text-xl sm:text-2xl font-bold mb-1 text-center ${feedback.correct ? 'text-emerald-300' : 'text-red-300'}`}>
                      {feedback.correct ? 'Correct !' : 'Incorrect'}
                    </div>
                    {!feedback.correct && (
                      <div className="text-gray-300 text-sm text-center mb-1">
                        Réponse : <span className="font-bold text-white">{feedback.expected.join(' / ')}</span>
                      </div>
                    )}
                    <div className="text-gray-500 text-xs text-center mb-5 sm:mb-6">
                      Tu as choisi : {feedback.chosen}
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={drawCard}
                    className="bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/10
                      text-white font-bold py-3 px-10 rounded-xl cursor-pointer select-none min-h-[48px]
                      transition-all"
                  >
                    Suivant →
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-2 sm:py-3 text-gray-600 text-[10px] sm:text-xs space-y-0.5 px-4">
          <div>
            {stats.totalReviews} réponses · Meilleure série : {stats.bestStreak}
          </div>
          <button
            onClick={() => setShowConfirmReset(true)}
            className="text-gray-700 hover:text-gray-400 underline text-[10px] sm:text-xs cursor-pointer bg-transparent border-none transition-colors"
          >
            Réinitialiser
          </button>
        </footer>
      </div>

      {/* Cheat sheet modal */}
      <CheatSheet open={showCheatSheet} onClose={() => setShowCheatSheet(false)} />

      {/* Reset confirmation modal */}
      <AnimatePresence>
        {showConfirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl p-5 sm:p-6 w-full max-w-sm border border-gray-700/60 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-2">Réinitialiser ?</h3>
              <p className="text-gray-400 text-sm mb-5">
                Toute ta progression sera effacée. Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl cursor-pointer transition-colors min-h-[44px]"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl cursor-pointer transition-colors min-h-[44px]"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
