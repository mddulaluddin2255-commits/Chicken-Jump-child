import React from 'react';

export const ChickenLogo: React.FC = () => {
  return (
    <div id="chicken-jump-logo" className="flex flex-col items-center select-none py-2">
      {/* Animated Chicken Mascot Graphic */}
      <div className="relative mb-2">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 border-4 border-amber-500 shadow-xl shadow-amber-500/20 flex items-center justify-center relative overflow-hidden group">
          {/* Farm hill in badge background */}
          <div className="absolute bottom-0 w-36 h-14 bg-emerald-500 rounded-t-full -mb-3" />
          <div className="absolute bottom-0 w-36 h-6 bg-amber-700" />

          {/* SVG Jumping Chicken */}
          <svg
            viewBox="0 0 100 100"
            className="w-20 h-20 sm:w-22 sm:h-22 relative z-10 animate-bounce duration-1000 drop-shadow-md"
          >
            {/* Tail */}
            <path d="M 24 50 C 14 42 10 52 24 58 Z" fill="#f59e0b" />
            <path d="M 26 46 C 18 36 12 46 25 52 Z" fill="#fbbf24" />

            {/* Feet */}
            <path d="M 40 76 L 40 84 M 40 84 L 35 86 M 40 84 L 45 86" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
            <path d="M 54 74 L 54 82 M 54 82 L 49 84 M 54 82 L 59 84" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />

            {/* Body */}
            <ellipse cx="48" cy="56" rx="24" ry="22" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />

            {/* Wing */}
            <ellipse cx="42" cy="58" rx="14" ry="9" fill="#fef08a" stroke="#fde047" strokeWidth="1.5" transform="rotate(-10 42 58)" />

            {/* Comb */}
            <circle cx="56" cy="30" r="6" fill="#dc2626" />
            <circle cx="63" cy="28" r="6.5" fill="#dc2626" />
            <circle cx="70" cy="31" r="5.5" fill="#dc2626" />

            {/* Wattle */}
            <ellipse cx="72" cy="58" rx="4" ry="6" fill="#ef4444" />

            {/* Beak */}
            <polygon points="72,46 84,51 72,56" fill="#f59e0b" />

            {/* Eye */}
            <circle cx="64" cy="44" r="3.5" fill="#1c1917" />
            <circle cx="65.5" cy="43" r="1.2" fill="#ffffff" />
          </svg>
        </div>

        {/* Small badge spark */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
        </span>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 font-['Fredoka'] drop-shadow-xs text-center flex items-center gap-2">
        <span className="text-amber-500">CHICKEN</span>
        <span className="text-emerald-600">JUMP</span>
      </h1>
      <p className="text-xs sm:text-sm text-stone-600 font-medium tracking-wide mt-1">
        Dodge hurdles • Collect golden corn • Jump to victory
      </p>
    </div>
  );
};
