import React from 'react';

export const HangyudonCharacter: React.FC<{
  className?: string;
  size?: number;
  mood?: 'happy' | 'ramen' | 'wink' | 'hero';
}> = ({ className = '', size = 120, mood = 'happy' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top Dorsal Fin */}
      <path
        d="M60 22 C60 10, 70 8, 70 8 C70 8, 80 10, 80 22"
        fill="#38b2ac"
        stroke="#1e3a5f"
        strokeWidth="3.5"
      />
      <path
        d="M50 26 C50 16, 58 14, 58 14"
        stroke="#1e3a5f"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M82 14 C82 14, 90 16, 90 26"
        stroke="#1e3a5f"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Main Body */}
      <ellipse
        cx="70"
        cy="75"
        rx="50"
        ry="50"
        fill="#4ecdc4"
        stroke="#1e3a5f"
        strokeWidth="4"
      />

      {/* Tummy highlight */}
      <ellipse
        cx="70"
        cy="92"
        rx="28"
        ry="22"
        fill="#fef08a"
        stroke="#1e3a5f"
        strokeWidth="3"
      />

      {/* Left Fin / Arm */}
      <path
        d="M22 75 C10 80, 12 95, 24 90"
        fill="#4ecdc4"
        stroke="#1e3a5f"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Right Fin / Arm */}
      <path
        d={
          mood === 'ramen'
            ? "M118 75 C125 70, 130 85, 115 88"
            : "M118 75 C130 80, 128 95, 116 90"
        }
        fill="#4ecdc4"
        stroke="#1e3a5f"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Eyes */}
      {/* Left Eye */}
      <circle cx="50" cy="55" r="14" fill="#ffffff" stroke="#1e3a5f" strokeWidth="3.5" />
      <circle cx="51" cy="55" r="7.5" fill="#1e3a5f" />
      <circle cx="54" cy="52" r="2.8" fill="#ffffff" />

      {/* Right Eye */}
      {mood === 'wink' ? (
        <path
          d="M80 57 Q90 48 100 57"
          stroke="#1e3a5f"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <>
          <circle cx="90" cy="55" r="14" fill="#ffffff" stroke="#1e3a5f" strokeWidth="3.5" />
          <circle cx="89" cy="55" r="7.5" fill="#1e3a5f" />
          <circle cx="86" cy="52" r="2.8" fill="#ffffff" />
        </>
      )}

      {/* Iconic Hangyudon Wavy Salmon Lips */}
      <path
        d="M50 72 C55 67, 65 67, 70 70 C75 67, 85 67, 90 72 C92 78, 85 84, 70 83 C55 84, 48 78, 50 72 Z"
        fill="#ff8fab"
        stroke="#1e3a5f"
        strokeWidth="3.5"
      />
      <line x1="56" y1="73" x2="84" y2="73" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />

      {/* Cute Blush */}
      <ellipse cx="32" cy="70" rx="5" ry="3.5" fill="#f43f5e" opacity="0.45" />
      <ellipse cx="108" cy="70" rx="5" ry="3.5" fill="#f43f5e" opacity="0.45" />

      {/* Feet */}
      <ellipse cx="56" cy="124" rx="10" ry="7" fill="#4ecdc4" stroke="#1e3a5f" strokeWidth="3.5" />
      <ellipse cx="84" cy="124" rx="10" ry="7" fill="#4ecdc4" stroke="#1e3a5f" strokeWidth="3.5" />

      {/* Hero cape or Ramen bowl if mood requires */}
      {mood === 'ramen' && (
        <g transform="translate(52, 92) scale(0.35)">
          <path d="M10 20 Q50 60 90 20 Z" fill="#ef4444" stroke="#1e3a5f" strokeWidth="6" />
          <ellipse cx="50" cy="20" rx="40" ry="12" fill="#fef08a" stroke="#1e3a5f" strokeWidth="5" />
          {/* Naruto fishcake */}
          <circle cx="50" cy="20" r="8" fill="#ffffff" stroke="#ec4899" strokeWidth="3" />
        </g>
      )}
    </svg>
  );
};

export const SayuriOctopus: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = '', size = 80 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sayuri Head */}
      <circle cx="50" cy="42" r="30" fill="#fb7185" stroke="#1e3a5f" strokeWidth="3.5" />

      {/* Cute yellow hair ribbon */}
      <g transform="translate(68, 16) scale(0.7)">
        <polygon points="10,0 24,14 10,28 17,14" fill="#fde047" stroke="#1e3a5f" strokeWidth="3" />
        <polygon points="0,0 -14,14 0,28 -7,14" fill="#fde047" stroke="#1e3a5f" strokeWidth="3" />
        <circle cx="5" cy="14" r="5" fill="#facc15" stroke="#1e3a5f" strokeWidth="3" />
      </g>

      {/* Eyes */}
      <circle cx="40" cy="40" r="4.5" fill="#1e3a5f" />
      <circle cx="41.5" cy="38.5" r="1.5" fill="#ffffff" />
      <circle cx="60" cy="40" r="4.5" fill="#1e3a5f" />
      <circle cx="61.5" cy="38.5" r="1.5" fill="#ffffff" />

      {/* Mouth */}
      <circle cx="50" cy="49" r="4" fill="#881337" stroke="#1e3a5f" strokeWidth="2.5" />

      {/* Blush */}
      <ellipse cx="32" cy="46" rx="3.5" ry="2" fill="#f43f5e" opacity="0.6" />
      <ellipse cx="68" cy="46" rx="3.5" ry="2" fill="#f43f5e" opacity="0.6" />

      {/* Tentacles */}
      <path
        d="M26 65 Q22 82 30 84 Q38 82 36 68 Q34 85 45 84 Q50 78 48 68 Q52 85 60 84 Q66 78 62 68 Q64 85 75 83 Q78 75 74 65"
        fill="#fb7185"
        stroke="#1e3a5f"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const HangyudonHoodHeadband: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 160, className = '' }) => {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dorsal Fin */}
      <path
        d="M80 8 C70 8, 70 24, 70 24 C70 24, 80 20, 90 24 C90 24, 90 8, 80 8 Z"
        fill="#38b2ac"
        stroke="#1e3a5f"
        strokeWidth="3.5"
      />
      {/* Left/Right fins */}
      <path d="M60 20 C54 12, 64 12, 68 22" fill="#38b2ac" stroke="#1e3a5f" strokeWidth="3" />
      <path d="M100 20 C106 12, 96 12, 92 22" fill="#38b2ac" stroke="#1e3a5f" strokeWidth="3" />

      {/* Arch headband */}
      <path
        d="M20 95 C20 40, 140 40, 140 95"
        fill="none"
        stroke="#4ecdc4"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M20 95 C20 40, 140 40, 140 95"
        fill="none"
        stroke="#1e3a5f"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Mini Hangyudon face on center */}
      <circle cx="80" cy="42" r="18" fill="#4ecdc4" stroke="#1e3a5f" strokeWidth="3" />
      <circle cx="73" cy="38" r="4" fill="#ffffff" stroke="#1e3a5f" strokeWidth="2" />
      <circle cx="74" cy="38" r="2" fill="#1e3a5f" />
      <circle cx="87" cy="38" r="4" fill="#ffffff" stroke="#1e3a5f" strokeWidth="2" />
      <circle cx="86" cy="38" r="2" fill="#1e3a5f" />
      {/* Wavy lips */}
      <path
        d="M73 45 Q77 42 80 44 Q83 42 87 45 Q80 49 73 45 Z"
        fill="#ff8fab"
        stroke="#1e3a5f"
        strokeWidth="2"
      />
    </svg>
  );
};

export const RamenSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 80,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Steam */}
      <path
        d="M40 25 Q35 15 42 8"
        stroke="#cbd5e1"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M52 22 Q58 12 50 6"
        stroke="#cbd5e1"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M62 25 Q68 15 60 8"
        stroke="#cbd5e1"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bowl body */}
      <path
        d="M15 45 C15 78, 35 92, 50 92 C65 92, 85 78, 85 45 Z"
        fill="#ef4444"
        stroke="#1e3a5f"
        strokeWidth="4"
      />
      {/* Bowl Rim */}
      <ellipse
        cx="50"
        cy="45"
        rx="38"
        ry="15"
        fill="#fef08a"
        stroke="#1e3a5f"
        strokeWidth="4"
      />
      {/* Nori sheet */}
      <rect
        x="24"
        y="30"
        width="14"
        height="18"
        rx="2"
        transform="rotate(-15 24 30)"
        fill="#1e293b"
        stroke="#1e3a5f"
        strokeWidth="2"
      />
      {/* Naruto fishcake */}
      <circle cx="52" cy="45" r="9" fill="#ffffff" stroke="#f43f5e" strokeWidth="3" />
      <path
        d="M49 43 Q54 41 55 45 Q53 49 48 47"
        stroke="#f43f5e"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Chopsticks */}
      <line x1="12" y1="32" x2="88" y2="42" stroke="#b45309" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
};

export const ClamSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 80,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bottom Shell */}
      <ellipse cx="50" cy="62" rx="36" ry="24" fill="#ddd6fe" stroke="#1e3a5f" strokeWidth="4" />
      {/* Pearl */}
      <circle cx="50" cy="54" r="14" fill="#ffffff" stroke="#c084fc" strokeWidth="3" />
      <circle cx="46" cy="50" r="3" fill="#ffffff" />
      {/* Top Shell open */}
      <path
        d="M16 54 C16 28, 50 18, 50 18 C50 18, 84 28, 84 54 Z"
        fill="#c4b5fd"
        stroke="#1e3a5f"
        strokeWidth="4"
      />
      {/* Shell ridges */}
      <path d="M30 46 C36 28, 50 20, 50 20" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M70 46 C64 28, 50 20, 50 20" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 48 L50 20" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

export const SparkleSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 70,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main big 4-point star */}
      <path
        d="M40 5 Q40 35 10 40 Q40 45 40 75 Q40 45 70 40 Q40 35 40 5 Z"
        fill="#fef08a"
        stroke="#ca8a04"
        strokeWidth="2.5"
      />
      {/* Small accent star */}
      <path
        d="M62 12 Q62 22 52 24 Q62 26 62 36 Q62 26 72 24 Q62 22 62 12 Z"
        fill="#fde047"
        stroke="#ca8a04"
        strokeWidth="2"
      />
      {/* Tiny circle sparkles */}
      <circle cx="18" cy="62" r="3.5" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
      <circle cx="68" cy="58" r="2.5" fill="#ffffff" />
    </svg>
  );
};

export const BadgeSticker: React.FC<{
  text?: string;
  subtext?: string;
  size?: number;
  className?: string;
}> = ({ text = 'KAWAII', subtext = 'はんぎょどん', size = 90, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-gradient-to-tr from-pink-300 via-rose-200 to-teal-200 border-4 border-slate-800 shadow-md flex flex-col items-center justify-center text-center p-2 select-none ${className}`}
    >
      <span className="font-extrabold text-sm text-slate-900 tracking-wider font-cute">
        {text}
      </span>
      <span className="text-[10px] text-teal-900 font-semibold mt-0.5">
        {subtext}
      </span>
    </div>
  );
};
