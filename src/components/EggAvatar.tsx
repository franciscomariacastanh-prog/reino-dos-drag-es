import React from 'react';
import { Egg } from '../types';

interface EggAvatarProps {
  egg: Egg;
  size?: 'sm' | 'md' | 'lg';
  isCracking?: boolean;
  onClick?: () => void;
  className?: string;
}

export const EggAvatar: React.FC<EggAvatarProps> = ({
  egg,
  size = 'md',
  isCracking = false,
  onClick,
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-16 h-20',
    md: 'w-24 h-32',
    lg: 'w-36 h-48'
  };

  const isRobo = egg.element === 'robotico';
  const isApex = egg.isRoboticApex;

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none cursor-pointer group ${sizeMap[size]} ${className}`}
    >
      {/* Radiant Glow */}
      <div
        className={`absolute inset-0 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity ${
          isRobo ? 'animate-pulse-tech' : 'animate-pulse-glow'
        }`}
        style={{ backgroundColor: egg.design.glowColor }}
      />

      {/* SVG Egg */}
      <svg
        viewBox="0 0 100 130"
        className={`w-full h-full relative z-10 filter drop-shadow-xl transition-transform group-hover:scale-105 ${
          isCracking ? 'animate-egg-shake' : ''
        }`}
      >
        <defs>
          <linearGradient id={`egg-base-${egg.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={egg.design.baseColor} />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id={`egg-sheen-${egg.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Egg Shell Silhouette */}
        <path
          d="M 50 10 C 15 10, 5 70, 5 95 C 5 115, 25 125, 50 125 C 75 125, 95 115, 95 95 C 95 70, 85 10, 50 10 Z"
          fill={`url(#egg-base-${egg.id})`}
          stroke={isApex ? '#38bdf8' : egg.design.glowColor}
          strokeWidth={isApex ? "3" : "2"}
        />

        {/* Highlight Curvature */}
        <path
          d="M 45 15 C 25 15, 12 65, 12 90 C 12 105, 20 115, 30 118 C 22 105, 20 65, 35 25 Z"
          fill={`url(#egg-sheen-${egg.id})`}
        />

        {/* Element Patterns */}
        {egg.design.pattern === 'circuit-lines' && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none">
            {/* Tech Circuit Lines */}
            <path d="M 25 50 L 45 50 L 55 65 L 75 65" />
            <circle cx="25" cy="50" r="2.5" fill="#38bdf8" />
            <circle cx="75" cy="65" r="2.5" fill="#22d3ee" />

            <path d="M 35 85 L 50 85 L 60 75 L 80 75" />
            <circle cx="80" cy="75" r="2.5" fill="#38bdf8" />

            {/* Glowing Core for Apex Eggs */}
            {isApex && (
              <g>
                <circle cx="50" cy="70" r="10" fill="#06b6d4" opacity="0.8" className="animate-pulse" />
                <circle cx="50" cy="70" r="5" fill="#ffffff" />
              </g>
            )}
          </g>
        )}

        {egg.design.pattern === 'magma-cracks' && (
          <g stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M 40 35 L 52 50 L 45 70 L 60 85 L 50 105" />
            <path d="M 52 50 L 70 55 L 75 75" stroke="#f97316" strokeWidth="1.5" />
            <circle cx="45" cy="70" r="3" fill="#fef08a" />
          </g>
        )}

        {egg.design.pattern === 'water-ripples' && (
          <g stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8">
            <ellipse cx="50" cy="55" rx="25" ry="12" />
            <ellipse cx="50" cy="80" rx="30" ry="15" />
          </g>
        )}

        {egg.design.pattern === 'ice-shards' && (
          <g stroke="#e0f2fe" strokeWidth="1.8" fill="none">
            <polygon points="50,30 65,55 50,60 35,55" fill="rgba(186, 230, 253, 0.4)" />
            <polygon points="50,65 70,85 50,105 30,85" fill="rgba(186, 230, 253, 0.3)" />
          </g>
        )}

        {egg.design.pattern === 'leaf-veins' && (
          <g stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" fill="none">
            <path d="M 50 25 C 50 65, 50 85, 50 110" />
            <path d="M 50 45 Q 35 38 25 50" />
            <path d="M 50 55 Q 65 48 75 60" />
            <path d="M 50 75 Q 35 68 25 80" />
            <path d="M 50 85 Q 65 78 75 90" />
          </g>
        )}

        {egg.design.pattern === 'rune-markings' && (
          <g stroke={egg.design.glowColor} strokeWidth="1.5" fill="none" opacity="0.85">
            <circle cx="50" cy="65" r="14" />
            <polygon points="50,55 60,72 40,72" />
            <circle cx="50" cy="65" r="3" fill={egg.design.glowColor} />
          </g>
        )}

        {/* Dynamic Cracks when Cracking */}
        {isCracking && (
          <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M 50 20 L 45 45 L 60 60 L 38 85 L 52 110" />
            <path d="M 45 45 L 30 55" />
            <path d="M 60 60 L 75 50" />
            <path d="M 38 85 L 20 95" />
          </g>
        )}
      </svg>

      {/* Apex / Best Nest badge */}
      {isApex && !egg.isSecretIslandExclusive && (
        <span className="absolute -top-1 right-0 bg-cyan-500 text-slate-950 font-tech font-extrabold text-[10px] px-1.5 py-0.5 rounded-full shadow-lg animate-bounce uppercase">
          APEX
        </span>
      )}

      {/* Secret Island Exclusive Badge */}
      {egg.isSecretIslandExclusive && (
        <span className="absolute -top-1 right-0 bg-gradient-to-r from-amber-400 to-purple-500 text-slate-950 font-mono font-extrabold text-[9px] px-1.5 py-0.5 rounded-full shadow-lg animate-pulse uppercase border border-amber-300">
          ✨ SECRETO
        </span>
      )}
    </div>
  );
};
