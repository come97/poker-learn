type Suit = 'spade' | 'heart' | 'club' | 'diamond';

const SUIT_CONFIG: Record<Suit, { symbol: string; color: string }> = {
  spade:   { symbol: '♠', color: '#1a1a2e' },
  heart:   { symbol: '♥', color: '#dc2626' },
  club:    { symbol: '♣', color: '#1a1a2e' },
  diamond: { symbol: '♦', color: '#dc2626' },
};

type PlayingCardProps = {
  rank: string;
  suit: Suit;
  className?: string;
};

export default function PlayingCard({ rank, suit, className = '' }: PlayingCardProps) {
  const { symbol, color } = SUIT_CONFIG[suit];

  return (
    <div
      className={`relative bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.25)] border border-gray-200
        w-[72px] h-[104px] sm:w-[88px] sm:h-[126px] select-none flex-shrink-0 ${className}`}
      style={{ perspective: '600px' }}
    >
      {/* Subtle inner gradient for realism */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white via-gray-50 to-gray-100 pointer-events-none" />

      {/* Top-left index */}
      <div className="absolute top-1.5 left-2 sm:top-2 sm:left-2.5 flex flex-col items-center leading-none z-10">
        <span
          className="text-[15px] sm:text-[18px] font-black"
          style={{ color }}
        >
          {rank}
        </span>
        <span
          className="text-[12px] sm:text-[14px] -mt-0.5"
          style={{ color }}
        >
          {symbol}
        </span>
      </div>

      {/* Center suit — large */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <span
          className="text-[32px] sm:text-[40px] opacity-90"
          style={{ color }}
        >
          {symbol}
        </span>
      </div>

      {/* Bottom-right index (rotated) */}
      <div className="absolute bottom-1.5 right-2 sm:bottom-2 sm:right-2.5 flex flex-col items-center leading-none rotate-180 z-10">
        <span
          className="text-[15px] sm:text-[18px] font-black"
          style={{ color }}
        >
          {rank}
        </span>
        <span
          className="text-[12px] sm:text-[14px] -mt-0.5"
          style={{ color }}
        >
          {symbol}
        </span>
      </div>
    </div>
  );
}

export type { Suit };
