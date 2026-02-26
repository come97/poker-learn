import { motion, AnimatePresence } from 'framer-motion';

type CheatSheetProps = {
  open: boolean;
  onClose: () => void;
};

type RangeRow = {
  hands: string;
  utg: string;
  middle: string;
  cutoff: string;
  blinds: string;
};

const RANGES: RangeRow[] = [
  { hands: 'AA, KK, QQ, JJ', utg: 'Raise', middle: 'Raise', cutoff: 'Raise', blinds: 'Raise / 3-Bet' },
  { hands: 'TT, 99', utg: 'Raise', middle: 'Raise', cutoff: 'Raise', blinds: 'Raise' },
  { hands: '88, 77', utg: 'Fold', middle: 'Raise', cutoff: 'Raise', blinds: 'Raise' },
  { hands: '66 – 22', utg: 'Fold', middle: 'Fold', cutoff: 'Raise', blinds: 'Call' },
  { hands: 'AKs, AKo, AQs', utg: 'Raise', middle: 'Raise', cutoff: 'Raise', blinds: '3-Bet' },
  { hands: 'AQo, AJs, ATs', utg: 'Fold', middle: 'Raise', cutoff: 'Raise', blinds: 'Raise' },
  { hands: 'KQs, KJs', utg: 'Fold', middle: 'Raise', cutoff: 'Raise', blinds: 'Raise' },
  { hands: 'A9s – A2s', utg: 'Fold', middle: 'Fold', cutoff: 'Raise', blinds: 'Call' },
  { hands: 'JTs, T9s, 98s', utg: 'Fold', middle: 'Fold', cutoff: 'Raise', blinds: 'Call' },
  { hands: 'Tout le reste', utg: 'Fold', middle: 'Fold', cutoff: 'Fold', blinds: 'Fold' },
];

function actionBadge(action: string) {
  const colors: Record<string, string> = {
    Raise: 'bg-green-600/20 text-green-300 border-green-600/30',
    Fold: 'bg-red-600/15 text-red-400 border-red-600/20',
    Call: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
    '3-Bet': 'bg-blue-600/20 text-blue-300 border-blue-600/30',
    'Raise / 3-Bet': 'bg-purple-600/20 text-purple-300 border-purple-600/30',
  };
  const cls = colors[action] || 'bg-gray-700 text-gray-300 border-gray-600';
  return (
    <span className={`inline-block text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded border ${cls}`}>
      {action}
    </span>
  );
}

export default function CheatSheet({ open, onClose }: CheatSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm pt-8 sm:pt-16 px-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85dvh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700/50">
              <h2 className="text-base sm:text-lg font-bold text-white">
                <span className="text-emerald-400">♠</span> Tableau des Ranges
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700/50 cursor-pointer text-xl"
              >
                ×
              </button>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1 p-3 sm:p-5">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">
                    <th className="text-left pb-2 sm:pb-3 pr-2 font-semibold">Main</th>
                    <th className="pb-2 sm:pb-3 px-1 font-semibold">UTG</th>
                    <th className="pb-2 sm:pb-3 px-1 font-semibold">Middle</th>
                    <th className="pb-2 sm:pb-3 px-1 font-semibold">Cutoff</th>
                    <th className="pb-2 sm:pb-3 pl-1 font-semibold">Blinds</th>
                  </tr>
                </thead>
                <tbody>
                  {RANGES.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t border-gray-800/60"
                    >
                      <td className="py-2 sm:py-2.5 pr-2 text-white font-semibold whitespace-nowrap text-xs sm:text-sm">
                        {row.hands}
                      </td>
                      <td className="py-2 sm:py-2.5 px-1 text-center">{actionBadge(row.utg)}</td>
                      <td className="py-2 sm:py-2.5 px-1 text-center">{actionBadge(row.middle)}</td>
                      <td className="py-2 sm:py-2.5 px-1 text-center">{actionBadge(row.cutoff)}</td>
                      <td className="py-2 sm:py-2.5 pl-1 text-center">{actionBadge(row.blinds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-gray-700/50">
              <button
                onClick={onClose}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
