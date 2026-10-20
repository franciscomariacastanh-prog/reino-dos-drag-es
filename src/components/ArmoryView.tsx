import React, { useState } from 'react';
import { Dragon, Armor, DragonElement, ArmorSlot } from '../types';
import { ALL_ARMORS } from '../data/armors';
import { DragonAvatar } from './DragonAvatar';
import { soundFx } from '../utils/audio';
import { Shield, Sparkles, Zap, Heart, Check, Flame, Waves, Trees, Cpu, Snowflake, Skull, Sun } from 'lucide-react';

interface ArmoryViewProps {
  dragons: Dragon[];
  activeDragonId: string;
  onUpdateDragonArmor: (dragonId: string, slot: ArmorSlot, armor: Armor | undefined) => void;
  onEquipFullSet: (dragonId: string, element: DragonElement) => void;
}

export const ArmoryView: React.FC<ArmoryViewProps> = ({
  dragons,
  activeDragonId,
  onUpdateDragonArmor,
  onEquipFullSet
}) => {
  const [selectedDragonId, setSelectedDragonId] = useState<string>(activeDragonId);
  const [elementFilter, setElementFilter] = useState<DragonElement | 'todos'>('todos');
  const [slotFilter, setSlotFilter] = useState<ArmorSlot | 'todos'>('todos');

  const selectedDragon = dragons.find(d => d.id === selectedDragonId) || dragons[0];

  const elementIcons: Record<DragonElement, React.ReactNode> = {
    magma: <Flame className="w-4 h-4 text-orange-500" />,
    aquatico: <Waves className="w-4 h-4 text-sky-400" />,
    floresta: <Trees className="w-4 h-4 text-emerald-400" />,
    robotico: <Cpu className="w-4 h-4 text-cyan-400" />,
    neve: <Snowflake className="w-4 h-4 text-blue-300" />,
    pantano: <Skull className="w-4 h-4 text-lime-400" />,
    planicie: <Sun className="w-4 h-4 text-amber-400" />,
    ancestral: <Sparkles className="w-4 h-4 text-amber-300" />,
    negro: <Skull className="w-4 h-4 text-purple-400" />,
    eletrico: <Zap className="w-4 h-4 text-cyan-300" />
  };

  const filteredArmors = ALL_ARMORS.filter(armor => {
    if (elementFilter !== 'todos' && armor.element !== elementFilter) return false;
    if (slotFilter !== 'todos' && armor.slot !== slotFilter) return false;
    return true;
  });

  // Calculate total stats from equipped armors
  interface ArmorStatAccumulator {
    atk: number;
    def: number;
    hp: number;
    spd: number;
    matchingPieces: number;
  }

  const armorStats = (Object.values(selectedDragon.equippedArmor) as (Armor | undefined)[]).reduce<ArmorStatAccumulator>(
    (acc, arm) => {
      if (!arm) return acc;
      const isMatching = arm.element === selectedDragon.element;
      const multiplier = isMatching ? 1 + arm.elementPowerBonus / 100 : 1;

      return {
        atk: acc.atk + Math.round(arm.atkBonus * multiplier),
        def: acc.def + Math.round(arm.defBonus * multiplier),
        hp: acc.hp + Math.round(arm.hpBonus * multiplier),
        spd: acc.spd + Math.round(arm.spdBonus * multiplier),
        matchingPieces: acc.matchingPieces + (isMatching ? 1 : 0)
      };
    },
    { atk: 0, def: 0, hp: 0, spd: 0, matchingPieces: 0 }
  );

  const slots: ArmorSlot[] = ['elmo', 'peitoral', 'asas', 'garras'];

  return (
    <div className="space-y-6">
      {/* Top Banner: Dragon Selection & Free Arsenal Info */}
      <div className="bg-[#111114] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/5 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              100% Grátis & Ilimitado
            </span>
            <span className="text-[11px] text-orange-400 font-mono">
              ★ Fortalece dragões dos respetivos elementos
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-light text-white">
            Arsenal Dracônico <span className="font-serif italic text-orange-400 font-normal">Imperial</span>
          </h2>
          <p className="text-xs text-white/50">
            Equipe livremente armaduras de magma, robóticas, abissais, silvestres, glaciais, venenosas e das estepes.
          </p>
        </div>

        {/* Dragon Selector Tabs */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] text-white/40 font-mono uppercase">Dragão:</span>
          {dragons.map(d => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDragonId(d.id);
                soundFx.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                selectedDragonId === d.id
                  ? 'bg-gradient-to-r from-orange-600 to-red-700 text-white shadow font-extrabold'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {elementIcons[d.element]}
              <span>{d.name.split(',')[0]}</span>
              {d.isTitanPermanent && (
                <span className="text-[9px] bg-red-600/80 text-white px-1 py-0.2 rounded uppercase font-mono">Titã</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left side Dragon Display & Equipped Slots, Right side Arsenal Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Dragon Preview & Current Equipped Slots */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#111114] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Dragon Avatar with live armor preview */}
            <div className="my-2">
              <DragonAvatar dragon={selectedDragon} size="lg" />
            </div>

            <h3 className="text-xl font-light text-white font-serif italic">
              {selectedDragon.name}
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-white/50 mt-1 mb-4 capitalize">
              <span>{selectedDragon.species}</span>
              <span>•</span>
              <span className="text-orange-400">Nível {selectedDragon.level}</span>
            </div>

            {/* Total Armor Stat Bonuses */}
            <div className="w-full bg-[#0d0d10] border border-white/10 rounded-xl p-3.5 mb-4 text-xs font-mono">
              <div className="text-white/60 text-center uppercase tracking-wider mb-2.5 font-bold flex items-center justify-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Bónus Total das Armaduras
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/5 border border-white/5 p-2 rounded-lg">
                  <div className="text-white/50 flex items-center justify-center gap-1 text-[10px]">
                    <Heart className="w-3 h-3 text-rose-500" /> HP
                  </div>
                  <div className="text-emerald-400 font-bold mt-0.5">+{armorStats.hp}</div>
                </div>
                <div className="bg-white/5 border border-white/5 p-2 rounded-lg">
                  <div className="text-white/50 flex items-center justify-center gap-1 text-[10px]">
                    <Zap className="w-3 h-3 text-orange-400" /> ATK
                  </div>
                  <div className="text-emerald-400 font-bold mt-0.5">+{armorStats.atk}</div>
                </div>
                <div className="bg-white/5 border border-white/5 p-2 rounded-lg">
                  <div className="text-white/50 flex items-center justify-center gap-1 text-[10px]">
                    <Shield className="w-3 h-3 text-blue-400" /> DEF
                  </div>
                  <div className="text-emerald-400 font-bold mt-0.5">+{armorStats.def}</div>
                </div>
                <div className="bg-white/5 border border-white/5 p-2 rounded-lg">
                  <div className="text-white/50 flex items-center justify-center gap-1 text-[10px]">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> SPD
                  </div>
                  <div className="text-emerald-400 font-bold mt-0.5">+{armorStats.spd}</div>
                </div>
              </div>

              {/* Elemental Synergy Notice */}
              {armorStats.matchingPieces > 0 && (
                <div className="mt-2.5 text-[11px] text-orange-300 bg-orange-950/30 border border-orange-500/30 rounded-lg p-2 flex items-center justify-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>
                    <strong>Sinergia Elemental ({armorStats.matchingPieces}/4):</strong> +Bónus amplificado para o elemento {selectedDragon.element.toUpperCase()}!
                  </span>
                </div>
              )}
            </div>

            {/* 4 Equipped Slots Display */}
            <div className="w-full space-y-2">
              <div className="text-[10px] uppercase font-mono tracking-wider text-white/50 text-left mb-1">
                Peças Atualmente Equipadas
              </div>
              <div className="grid grid-cols-2 gap-2">
                {slots.map(slot => {
                  const piece = selectedDragon.equippedArmor[slot];
                  const isMatching = piece && piece.element === selectedDragon.element;

                  return (
                    <div
                      key={slot}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        piece
                          ? isMatching
                            ? 'bg-orange-950/20 border-orange-500/40'
                            : 'bg-white/5 border-white/10'
                          : 'bg-white/[0.02] border-dashed border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-white/40 font-mono uppercase mb-1">
                        <span>{slot}</span>
                        {piece && (
                          <button
                            onClick={() => {
                              onUpdateDragonArmor(selectedDragon.id, slot, undefined);
                              soundFx.playClick();
                            }}
                            className="text-white/40 hover:text-red-400 transition-colors"
                            title="Desequipar"
                          >
                            Remover
                          </button>
                        )}
                      </div>

                      {piece ? (
                        <div>
                          <div className="font-bold text-xs text-white truncate">{piece.name}</div>
                          <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                            {elementIcons[piece.element]}
                            <span>+{piece.atkBonus} ATK | +{piece.defBonus} DEF</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-white/30 italic py-1 font-mono">Vazio</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick 1-Click Equip Full Matching Set */}
              <button
                onClick={() => {
                  onEquipFullSet(selectedDragon.id, selectedDragon.element);
                  soundFx.playEquip();
                }}
                className="w-full mt-3 py-2.5 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Equipar Conjunto Completo ({selectedDragon.element.toUpperCase()})
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Available Free Armors Catalog & Filters */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#111114] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
            {/* Element Filters */}
            <div>
              <span className="text-[10px] text-white/50 font-mono uppercase block mb-1.5">
                Filtrar por Elemento Fortalecido:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setElementFilter('todos')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    elementFilter === 'todos'
                      ? 'bg-white text-slate-950 shadow'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Todos ({ALL_ARMORS.length})
                </button>
                {(['magma', 'robotico', 'aquatico', 'floresta', 'neve', 'pantano', 'planicie'] as DragonElement[]).map(
                  el => (
                    <button
                      key={el}
                      onClick={() => setElementFilter(el)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                        elementFilter === el
                          ? 'bg-gradient-to-r from-orange-600 to-red-700 text-white shadow'
                          : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {elementIcons[el]}
                      <span className="capitalize">{el}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Slot Filters */}
            <div>
              <span className="text-[10px] text-white/50 font-mono uppercase block mb-1.5">
                Filtrar por Parte do Corpo:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSlotFilter('todos')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    slotFilter === 'todos'
                      ? 'bg-white text-slate-950 shadow'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Todas as Partes
                </button>
                {slots.map(s => (
                  <button
                    key={s}
                    onClick={() => setSlotFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all ${
                      slotFilter === s
                        ? 'bg-white text-slate-950 shadow'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Armors Grid */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredArmors.map(armor => {
              const isEquipped = selectedDragon.equippedArmor[armor.slot]?.id === armor.id;
              const matchesDragonElement = armor.element === selectedDragon.element;

              return (
                <div
                  key={armor.id}
                  className={`bg-[#111114] border rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isEquipped
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : matchesDragonElement
                      ? 'border-orange-500/40 hover:border-orange-500/80'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#0d0d10] border border-white/10 shrink-0">
                      {elementIcons[armor.element]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{armor.name}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
                          {armor.slot}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-emerald-400 border border-emerald-500/30 font-bold">
                          Grátis
                        </span>
                      </div>

                      <p className="text-xs text-white/50 mt-1 max-w-md leading-relaxed">
                        {armor.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono">
                        <span className="text-rose-400 font-bold">+{armor.hpBonus} HP</span>
                        <span className="text-orange-400 font-bold">+{armor.atkBonus} ATK</span>
                        <span className="text-blue-400 font-bold">+{armor.defBonus} DEF</span>
                        <span className="text-emerald-400 font-bold">+{armor.spdBonus} SPD</span>
                        {matchesDragonElement && (
                          <span className="text-orange-300 font-bold flex items-center gap-1 bg-orange-950/30 px-2 py-0.5 rounded border border-orange-500/30 text-[11px]">
                            <Flame className="w-3 h-3 text-orange-400" />
                            +{armor.elementPowerBonus}% Sinergia Elemental!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center sm:self-center">
                    {isEquipped ? (
                      <button
                        onClick={() => {
                          onUpdateDragonArmor(selectedDragon.id, armor.slot, undefined);
                          soundFx.playClick();
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Equipado (Remover)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onUpdateDragonArmor(selectedDragon.id, armor.slot, armor);
                          soundFx.playEquip();
                        }}
                        className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all active:scale-95"
                      >
                        Equipar Grátis
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
