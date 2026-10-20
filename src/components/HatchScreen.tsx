import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Egg, Dragon } from '../types';
import { createDragonFromEgg } from '../data/dragons';
import { EggAvatar } from './EggAvatar';
import { DragonAvatar } from './DragonAvatar';
import { soundFx } from '../utils/audio';
import { Sparkles, Shield, Zap, Heart, Check } from 'lucide-react';

interface HatchScreenProps {
  egg: Egg;
  onComplete: (newDragon: Dragon) => void;
  onCancel?: () => void;
}

export const HatchScreen: React.FC<HatchScreenProps> = ({ egg, onComplete }) => {
  const [cracks, setCracks] = useState<number>(0);
  const [hatchedDragon, setHatchedDragon] = useState<Dragon | null>(null);

  const handleTapEgg = () => {
    if (hatchedDragon) return;

    soundFx.playEggCrack();
    const nextCracks = cracks + 1;
    setCracks(nextCracks);

    if (nextCracks >= 3) {
      // Egg bursts open!
      const dragon = createDragonFromEgg(egg);
      setHatchedDragon(dragon);
      soundFx.playRoar(dragon.element);
      soundFx.playVictory();

      // Fire festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [dragon.visual.glowColor, '#fbbf24', '#ffffff', '#ef4444']
      });
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'tita':
        return 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white border-amber-300';
      case 'mitico':
        return 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-purple-300';
      case 'lendario':
        return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-200';
      case 'epico':
        return 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-blue-300';
      default:
        return 'bg-slate-700 text-slate-200 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: egg.design.glowColor }}
        />

        {!hatchedDragon ? (
          <div>
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow ${getRarityBadge(egg.rarity)}`}>
                Ovo {egg.rarity}
              </span>
              {egg.isRoboticApex && (
                <div className="text-cyan-400 font-tech font-bold text-sm mt-1 animate-pulse">
                  ⚡ NINHO DE GRAU APEX (BIOMA ROBÓTICO) ⚡
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold font-heading text-slate-100 mb-2">
              {egg.name}
            </h2>
            <p className="text-sm text-slate-400 mb-8">
              Clique no ovo repetidamente para rachar a casca e chocar o novo dragão!
            </p>

            <div className="my-8 flex justify-center">
              <div className="transform transition-transform active:scale-95 cursor-pointer">
                <EggAvatar
                  egg={egg}
                  size="lg"
                  isCracking={cracks > 0}
                  onClick={handleTapEgg}
                />
              </div>
            </div>

            {/* Crack Counter Bar */}
            <div className="w-48 mx-auto bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${(cracks / 3) * 100}%` }}
              />
            </div>

            <button
              onClick={handleTapEgg}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all active:scale-95 font-tech tracking-wide uppercase"
            >
              {cracks === 0 ? 'Tocar para Chocar' : `Rachando... (${cracks}/3)`}
            </button>
          </div>
        ) : (
          /* Dragon Hatched Reveal! */
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center items-center gap-1 text-amber-400 mb-2">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span className="font-tech text-sm tracking-wider uppercase font-bold">Novo Dragão Eclodido!</span>
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>

            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow mb-3 ${getRarityBadge(hatchedDragon.rarity)}`}>
              {hatchedDragon.rarity} • Nível {hatchedDragon.level}
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-100 mb-1">
              {hatchedDragon.name}
            </h2>
            <p className="text-xs text-amber-300/80 mb-6 italic">
              "{hatchedDragon.title}"
            </p>

            {/* Dragon Avatar */}
            <div className="flex justify-center mb-6">
              <DragonAvatar dragon={hatchedDragon} size="lg" />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-2 mb-6 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center font-tech">
              <div className="p-1">
                <div className="text-slate-400 text-xs flex items-center justify-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> HP
                </div>
                <div className="text-slate-100 font-bold text-sm">{hatchedDragon.hp}</div>
              </div>
              <div className="p-1">
                <div className="text-slate-400 text-xs flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> ATK
                </div>
                <div className="text-slate-100 font-bold text-sm">{hatchedDragon.atk}</div>
              </div>
              <div className="p-1">
                <div className="text-slate-400 text-xs flex items-center justify-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-400" /> DEF
                </div>
                <div className="text-slate-100 font-bold text-sm">{hatchedDragon.def}</div>
              </div>
              <div className="p-1">
                <div className="text-slate-400 text-xs flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> SPD
                </div>
                <div className="text-slate-100 font-bold text-sm">{hatchedDragon.spd}</div>
              </div>
            </div>

            {/* Free Starter Armor Included! */}
            {Object.values(hatchedDragon.equippedArmor).length > 0 && (
              <div className="text-xs bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-lg mb-6 flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Armadura elemental grátis equipada automaticamente ao nascer!</span>
              </div>
            )}

            <button
              onClick={() => onComplete(hatchedDragon)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all font-tech tracking-wider uppercase text-base"
            >
              Adicionar ao Santuário
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
