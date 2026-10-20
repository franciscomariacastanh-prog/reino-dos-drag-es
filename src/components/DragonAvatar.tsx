import React from 'react';
import { Dragon, DragonElement } from '../types';

interface DragonAvatarProps {
  dragon: Dragon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAura?: boolean;
  animate?: boolean;
  className?: string;
}

export const DragonAvatar: React.FC<DragonAvatarProps> = ({
  dragon,
  size = 'md',
  showAura = true,
  animate = true,
  className = ''
}) => {
  const { element, visual, isTitanPermanent, rarity } = dragon;

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80'
  };

  const getElementTheme = (el: DragonElement) => {
    switch (el) {
      case 'magma':
        return {
          glow: 'rgba(239, 68, 68, 0.7)',
          accent: '#ef4444',
          bodyGrad: ['#991b1b', '#ef4444', '#f97316'],
          bellyGrad: ['#f97316', '#fbbf24', '#fef08a'],
          eyeColor: '#fef08a',
          horns: '#450a0a',
          particles: ['#ef4444', '#f97316', '#eab308']
        };
      case 'robotico':
        return {
          glow: 'rgba(6, 182, 212, 0.8)',
          accent: '#06b6d4',
          bodyGrad: ['#0f172a', '#1e293b', '#0284c7'],
          bellyGrad: ['#06b6d4', '#38bdf8', '#e0f2fe'],
          eyeColor: '#22d3ee',
          horns: '#0891b2',
          particles: ['#06b6d4', '#3b82f6', '#a855f7']
        };
      case 'aquatico':
        return {
          glow: 'rgba(14, 165, 233, 0.7)',
          accent: '#0284c7',
          bodyGrad: ['#0c4a6e', '#0284c7', '#38bdf8'],
          bellyGrad: ['#38bdf8', '#7dd3fc', '#bae6fd'],
          eyeColor: '#e0f2fe',
          horns: '#0369a1',
          particles: ['#38bdf8', '#0ea5e9', '#67e8f9']
        };
      case 'floresta':
        return {
          glow: 'rgba(34, 197, 94, 0.7)',
          accent: '#16a34a',
          bodyGrad: ['#14532d', '#16a34a', '#22c55e'],
          bellyGrad: ['#4ade80', '#86efac', '#bbf7d0'],
          eyeColor: '#fef08a',
          horns: '#14532d',
          particles: ['#22c55e', '#4ade80', '#a3e635']
        };
      case 'neve':
        return {
          glow: 'rgba(56, 189, 248, 0.8)',
          accent: '#38bdf8',
          bodyGrad: ['#0369a1', '#38bdf8', '#bae6fd'],
          bellyGrad: ['#bae6fd', '#e0f2fe', '#ffffff'],
          eyeColor: '#0284c7',
          horns: '#0284c7',
          particles: ['#bae6fd', '#e0f2fe', '#38bdf8']
        };
      case 'pantano':
        return {
          glow: 'rgba(132, 204, 22, 0.7)',
          accent: '#84cc16',
          bodyGrad: ['#1a2e05', '#3f6212', '#65a30d'],
          bellyGrad: ['#84cc16', '#a3e635', '#d9f99d'],
          eyeColor: '#facc15',
          horns: '#1a2e05',
          particles: ['#84cc16', '#a3e635', '#4d7c0f']
        };
      case 'eletrico':
        return {
          glow: 'rgba(0, 240, 255, 0.85)',
          accent: '#00f0ff',
          bodyGrad: ['#082f49', '#0284c7', '#00f0ff'],
          bellyGrad: ['#facc15', '#fef08a', '#ffffff'],
          eyeColor: '#facc15',
          horns: '#0369a1',
          particles: ['#00f0ff', '#facc15', '#38bdf8']
        };
      case 'planicie':
      default:
        return {
          glow: 'rgba(234, 179, 8, 0.7)',
          accent: '#eab308',
          bodyGrad: ['#713f12', '#ca8a04', '#eab308'],
          bellyGrad: ['#facc15', '#fef08a', '#fef9c3'],
          eyeColor: '#ffffff',
          horns: '#854d0e',
          particles: ['#eab308', '#facc15', '#fde047']
        };
    }
  };

  const theme = getElementTheme(element);
  const isRobo = element === 'robotico';
  const hasHelm = !!dragon.equippedArmor.elmo;
  const hasChest = !!dragon.equippedArmor.peitoral;
  const hasWingsArmor = !!dragon.equippedArmor.asas;
  const hasClaws = !!dragon.equippedArmor.garras;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
    >
      {/* Background Glow Aura */}
      {showAura && (
        <div
          className={`absolute inset-0 rounded-full blur-2xl opacity-60 pointer-events-none transition-all duration-700 ${
            element === 'robotico' ? 'animate-pulse-tech' : 'animate-pulse-glow'
          }`}
          style={{ backgroundColor: theme.glow }}
        />
      )}

      {/* Dragon SVG Artwork */}
      <svg
        viewBox="0 0 320 320"
        className={`w-full h-full relative z-10 filter drop-shadow-lg ${
          animate ? 'animate-float' : ''
        }`}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id={`body-grad-${dragon.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.bodyGrad[0]} />
            <stop offset="50%" stopColor={theme.bodyGrad[1]} />
            <stop offset="100%" stopColor={theme.bodyGrad[2]} />
          </linearGradient>

          <linearGradient id={`belly-grad-${dragon.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.bellyGrad[0]} />
            <stop offset="100%" stopColor={theme.bellyGrad[1]} />
          </linearGradient>

          <linearGradient id={`wing-grad-${dragon.id}`} x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor={visual.secondaryColor || theme.accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={visual.primaryColor || theme.bodyGrad[0]} stopOpacity="0.7" />
          </linearGradient>

          {/* Armor Gold / Platinum Sheen Gradient */}
          <linearGradient id={`armor-plate-${dragon.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          <linearGradient id={`cyber-plate-${dragon.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* WINGS (Left & Right) */}
        <g className="origin-center transition-transform duration-500">
          {/* Left Wing */}
          <path
            d="M 120 150 C 70 80, 20 70, 10 120 C 5 150, 40 180, 110 180 Z"
            fill={`url(#wing-grad-${dragon.id})`}
            stroke={theme.bodyGrad[0]}
            strokeWidth="3"
          />
          <path
            d="M 120 150 Q 50 110 20 120 M 120 150 Q 60 140 30 155 M 120 150 Q 80 165 50 175"
            stroke={isRobo ? '#38bdf8' : theme.bellyGrad[0]}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Right Wing */}
          <path
            d="M 200 150 C 250 80, 300 70, 310 120 C 315 150, 280 180, 210 180 Z"
            fill={`url(#wing-grad-${dragon.id})`}
            stroke={theme.bodyGrad[0]}
            strokeWidth="3"
          />
          <path
            d="M 200 150 Q 270 110 300 120 M 200 150 Q 260 140 290 155 M 200 150 Q 240 165 270 175"
            stroke={isRobo ? '#38bdf8' : theme.bellyGrad[0]}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Armor on Wings */}
          {hasWingsArmor && (
            <g>
              <path
                d="M 100 140 C 60 90, 35 90, 25 115"
                stroke={isRobo ? "url(#cyber-plate-" + dragon.id + ")" : "url(#armor-plate-" + dragon.id + ")"}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 220 140 C 260 90, 285 90, 295 115"
                stroke={isRobo ? "url(#cyber-plate-" + dragon.id + ")" : "url(#armor-plate-" + dragon.id + ")"}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              {isRobo && (
                <circle cx="290" cy="115" r="4" fill="#22d3ee" className="animate-pulse" />
              )}
            </g>
          )}
        </g>

        {/* TAIL */}
        <path
          d="M 160 250 C 175 285, 220 295, 245 280 C 260 270, 270 250, 260 235"
          fill="none"
          stroke={`url(#body-grad-${dragon.id})`}
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Tail tip flame or blade */}
        {element === 'magma' ? (
          <path d="M 255 240 Q 285 220 265 200 Q 245 225 255 240 Z" fill="#f97316" />
        ) : isRobo ? (
          <polygon points="260,230 275,220 280,240" fill="#06b6d4" />
        ) : (
          <path d="M 255 240 Q 280 230 270 215 Z" fill={theme.accent} />
        )}

        {/* DRAGON MAIN BODY */}
        <ellipse
          cx="160"
          cy="195"
          rx="52"
          ry="65"
          fill={`url(#body-grad-${dragon.id})`}
          stroke={theme.horns}
          strokeWidth="3"
        />

        {/* BELLY PLATES */}
        <path
          d="M 140 160 C 140 220, 180 220, 180 160 C 170 150, 150 150, 140 160 Z"
          fill={`url(#belly-grad-${dragon.id})`}
          opacity="0.9"
        />
        <line x1="145" y1="175" x2="175" y2="175" stroke={theme.bodyGrad[0]} strokeWidth="2" />
        <line x1="142" y1="190" x2="178" y2="190" stroke={theme.bodyGrad[0]} strokeWidth="2" />
        <line x1="145" y1="205" x2="175" y2="205" stroke={theme.bodyGrad[0]} strokeWidth="2" />

        {/* CHEST ARMOR EQUIPPED */}
        {hasChest && (
          <g>
            <path
              d="M 132 170 L 160 155 L 188 170 L 175 210 L 160 225 L 145 210 Z"
              fill={isRobo ? "url(#cyber-plate-" + dragon.id + ")" : "url(#armor-plate-" + dragon.id + ")"}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            <circle cx="160" cy="185" r="7" fill={isRobo ? '#06b6d4' : '#ef4444'} className="animate-pulse" />
          </g>
        )}

        {/* DRAGON HEAD */}
        <path
          d="M 160 85 C 130 85, 125 125, 135 150 C 145 165, 175 165, 185 150 C 195 125, 190 85, 160 85 Z"
          fill={`url(#body-grad-${dragon.id})`}
          stroke={theme.horns}
          strokeWidth="3"
        />

        {/* HORNS / CROWN */}
        {isTitanPermanent || rarity === 'tita' ? (
          // Titan Crown Horns
          <g>
            <polygon points="135,95 105,45 130,75" fill={theme.horns} stroke="#f97316" strokeWidth="2" />
            <polygon points="185,95 215,45 190,75" fill={theme.horns} stroke="#f97316" strokeWidth="2" />
            <polygon points="160,88 160,35 170,75" fill="#f97316" />
            <polygon points="148,88 140,50 155,75" fill="#ef4444" />
          </g>
        ) : isRobo ? (
          // Cyber Antennas
          <g>
            <rect x="130" y="55" width="6" height="35" rx="3" fill="#0891b2" />
            <circle cx="133" cy="52" r="5" fill="#22d3ee" className="animate-pulse" />
            <rect x="184" y="55" width="6" height="35" rx="3" fill="#0891b2" />
            <circle cx="187" cy="52" r="5" fill="#22d3ee" className="animate-pulse" />
          </g>
        ) : (
          // Classic Draconic Horns
          <g>
            <path d="M 135 95 C 120 70, 100 65, 95 45 C 110 55, 125 70, 132 85" fill={theme.horns} />
            <path d="M 185 95 C 200 70, 220 65, 225 45 C 210 55, 195 70, 188 85" fill={theme.horns} />
          </g>
        )}

        {/* SNOUT & NOSTRILS */}
        <ellipse cx="160" cy="142" rx="18" ry="12" fill={theme.bodyGrad[1]} />
        <ellipse cx="153" cy="144" rx="3" ry="2" fill="#0f172a" />
        <ellipse cx="167" cy="144" rx="3" ry="2" fill="#0f172a" />
        {element === 'magma' && (
          // Smoke puff from nose
          <circle cx="153" cy="138" r="2.5" fill="#f97316" opacity="0.8" />
        )}

        {/* EYES */}
        {isRobo ? (
          // Cyber Visor Eye Bar
          <rect x="140" y="112" width="40" height="9" rx="4" fill="#06b6d4" stroke="#e0f2fe" strokeWidth="1.5" />
        ) : (
          <g>
            {/* Left Eye */}
            <ellipse cx="146" cy="116" rx="7" ry="5" fill="#0f172a" />
            <ellipse cx="146" cy="116" rx="5" ry="4" fill={theme.eyeColor} />
            <line x1="146" y1="112" x2="146" y2="120" stroke="#000" strokeWidth="2" strokeLinecap="round" />

            {/* Right Eye */}
            <ellipse cx="174" cy="116" rx="7" ry="5" fill="#0f172a" />
            <ellipse cx="174" cy="116" rx="5" ry="4" fill={theme.eyeColor} />
            <line x1="174" y1="112" x2="174" y2="120" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* HELMET ARMOR EQUIPPED */}
        {hasHelm && (
          <g>
            <path
              d="M 132 88 Q 160 70 188 88 L 180 110 Q 160 102 140 110 Z"
              fill={isRobo ? "url(#cyber-plate-" + dragon.id + ")" : "url(#armor-plate-" + dragon.id + ")"}
              stroke="#0f172a"
              strokeWidth="2"
            />
            <polygon points="160,65 155,80 165,80" fill={theme.accent} />
          </g>
        )}

        {/* FRONT CLAWS & FEET */}
        {/* Left Foot */}
        <ellipse cx="125" cy="245" rx="18" ry="12" fill={theme.bodyGrad[0]} />
        <path d="M 112 250 L 108 258 M 120 254 L 118 262 M 128 254 L 130 262" stroke={hasClaws ? '#facc15' : '#0f172a'} strokeWidth={hasClaws ? "4" : "3"} strokeLinecap="round" />

        {/* Right Foot */}
        <ellipse cx="195" cy="245" rx="18" ry="12" fill={theme.bodyGrad[0]} />
        <path d="M 182 254 L 180 262 M 192 254 L 194 262 M 202 250 L 206 258" stroke={hasClaws ? '#facc15' : '#0f172a'} strokeWidth={hasClaws ? "4" : "3"} strokeLinecap="round" />
      </svg>

      {/* Level / Titan Badge in Bottom Right */}
      {isTitanPermanent ? (
        <div className="absolute -bottom-2 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-tech font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-300 shadow-lg tracking-wider flex items-center gap-1 z-20">
          <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
          TITÃ LV.{dragon.level}
        </div>
      ) : (
        <div className="absolute -bottom-2 bg-slate-900/90 text-slate-200 font-tech font-bold text-xs px-2.5 py-0.5 rounded-full border border-slate-700 shadow-md z-20">
          LV.{dragon.level}
        </div>
      )}
    </div>
  );
};
