import { motion } from 'framer-motion';
import PlayingCard, { type Suit } from './PlayingCard';

type HandDisplayProps = {
  hand: string;
  animationKey: string;
};

// Parse "AKs" => { rank1: "A", rank2: "K", type: "suited" }
// Parse "88"  => { rank1: "8", rank2: "8", type: "pair" }
// Parse "AQo" => { rank1: "A", rank2: "Q", type: "offsuit" }
function parseHand(hand: string) {
  const isSuited = hand.endsWith('s');
  const isOffsuit = hand.endsWith('o');
  const base = (isSuited || isOffsuit) ? hand.slice(0, -1) : hand;

  let rank1: string, rank2: string;
  if (base.length === 2) {
    rank1 = base[0];
    rank2 = base[1];
  } else {
    // Shouldn't happen with our data, but fallback
    rank1 = base[0];
    rank2 = base.slice(1);
  }

  const isPair = rank1 === rank2;
  const type = isPair ? 'pair' : isSuited ? 'suited' : 'offsuit';

  return { rank1, rank2, type };
}

// Assign suits based on hand type
function getSuits(type: string): [Suit, Suit] {
  switch (type) {
    case 'suited':
      return ['spade', 'spade'];
    case 'offsuit':
      return ['spade', 'heart'];
    case 'pair':
      return ['spade', 'diamond'];
    default:
      return ['spade', 'heart'];
  }
}

const LABELS: Record<string, string> = {
  suited: 'Suited',
  offsuit: 'Offsuit',
  pair: 'Paire',
};

export default function HandDisplay({ hand, animationKey }: HandDisplayProps) {
  const { rank1, rank2, type } = parseHand(hand);
  const [suit1, suit2] = getSuits(type);

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      <motion.div
        key={animationKey}
        className="flex items-center gap-2 sm:gap-3"
        initial={{ scale: 0.7, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        {/* Card 1 */}
        <motion.div
          initial={{ rotate: -15, x: -30 }}
          animate={{ rotate: -6, x: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.05 }}
        >
          <PlayingCard rank={rank1} suit={suit1} />
        </motion.div>

        {/* Card 2 — slightly overlapping */}
        <motion.div
          initial={{ rotate: 15, x: 30 }}
          animate={{ rotate: 6, x: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
          className="-ml-4 sm:-ml-5"
        >
          <PlayingCard rank={rank2} suit={suit2} />
        </motion.div>
      </motion.div>

      {/* Type label */}
      <motion.span
        key={`${animationKey}-label`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs text-gray-400 font-medium tracking-wider uppercase"
      >
        {LABELS[type]}
      </motion.span>
    </div>
  );
}
