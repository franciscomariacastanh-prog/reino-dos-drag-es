import React, { useState, useEffect } from 'react';
import { Egg, Dragon, IncubatorSlot } from '../types';
import { EggAvatar } from './EggAvatar';
import { HatchScreen } from './HatchScreen';
import { soundFx } from '../utils/audio';
import { Flame, Cpu, Sparkles, Clock, Plus, X } from 'lucide-react';

interface IncubatorModalProps {
  slots: IncubatorSlot[];
  eggInventory: Egg[];
  onPlaceEgg: (slotId: number, egg: Egg) => void;
  onEggHatched: (slotId: number, hatchedDragon: Dragon) => void;
  onAccelerateEgg: (slotId: number, seconds: number) => void;
  onClose: () => void;
  isCreatorMode?: boolean;
  onAddEggs?: (eggs: Egg[]) => void;
}

export const IncubatorModal: React.FC<IncubatorModalProps> = ({
  slots,
  eggInventory,
  onPlaceEgg,
  onEggHatched,
  onAccelerateEgg,
  onClose,
  isCreatorMode = false,
  onAddEggs
}) => {
  const [selectedSlotForPlacement, setSelectedSlotForPlacement] = useState<number | null>(null);
  const [hatchingEgg, setHatchingEgg] = useState<{ slotId: number; egg: Egg } | null>(null);

  // Tick countdowns every second
  useEffect(() => {
    const timer = setInterval(() => {
      slots.forEach(slot => {
        if (slot.egg && slot.isIncubating && slot.egg.timeRemaining > 0) {
          onAccelerateEgg(slot.id, 1);
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [slots, onAccelerateEgg]);

  const handleAccelerateWithMagma = (slotId: number) => {
    soundFx.playFire();
    onAccelerateEgg(slotId, 15);
  };

  const handleInstantHatch = (slotId: number) => {
    soundFx.playFire();
    onAccelerateEgg(slotId, 9999);
  };

  const startHatchingProcess = (slotId: number, egg: Egg) => {
    setHatchingEgg({ slotId, egg });
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0a0a0c]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#0d0d10] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111114]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-orange-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-light text-white flex items-center gap-2">
                Incubadora Dracônica <span className="font-serif italic text-orange-400 font-normal">da Base</span>
              </h2>
              <p className="text-xs text-white/50">
                Choque os ovos resgatados dos 6 biomas (robótico, aquático, floresta, neve, pântano e planície)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Creator VIP Perks Banner */}
          {isCreatorMode && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/50 via-orange-950/30 to-[#121118] border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    👑 MESTRE TITÃ FRANCISCO • TUDO 100% GRÁTIS
                  </div>
                  <div className="text-[11px] text-white/70">
                    Choco instantâneo em 0 segundos e ovos divinos ilimitados exclusivos para ti!
                  </div>
                </div>
              </div>
              {onAddEggs && (
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => {
                      import('../data/creatorPerks').then(mod => {
                        onAddEggs(mod.getCreatorRemoteSecretIslandEggs());
                        soundFx.playVictory();
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 via-purple-600 to-amber-500 hover:brightness-110 text-white font-mono font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1"
                    title="Coleta remota dos 3 Ovos da Ilha Secreta (Vila Ancestral, Bioma Negro e Bioma Elétrico)"
                  >
                    ⚡ Coleta Remota: Ilha Secreta
                  </button>
                  <button
                    onClick={() => {
                      import('../data/creatorPerks').then(mod => {
                        onAddEggs(mod.getCreatorExclusiveEggs());
                        soundFx.playVictory();
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-mono font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                  >
                    🥚 Gerar 6 Ovos Titânicos (0s)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Slots Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/80">
                Câmaras de Incubação Térmica ({slots.filter(s => s.egg).length}/{slots.length} Ocupadas)
              </h3>
              <span className="text-xs text-orange-400 flex items-center gap-1 font-mono">
                <Flame className="w-3.5 h-3.5" /> Aquecimento Magmático Titã Grátis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {slots.map(slot => {
                const egg = slot.egg;
                const isReady = egg && egg.timeRemaining <= 0;

                return (
                  <div
                    key={slot.id}
                    className={`relative rounded-xl border p-4 flex flex-col items-center justify-between min-h-[260px] transition-all ${
                      egg
                        ? isReady
                          ? 'border-orange-500/80 bg-orange-950/20 shadow-lg shadow-orange-950/40'
                          : 'border-white/10 bg-[#111114]'
                        : 'border-dashed border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    {/* Slot Header */}
                    <div className="w-full flex items-center justify-between text-xs text-white/50 mb-2 font-mono">
                      <span className="uppercase tracking-wider">Câmara #{slot.id}</span>
                      {egg && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          egg.isRoboticApex ? 'border-cyan-400 text-cyan-300 bg-cyan-950/60' : 'border-white/15 text-white/70'
                        }`}>
                          {egg.element}
                        </span>
                      )}
                    </div>

                    {/* Slot Center: Egg or Empty */}
                    {egg ? (
                      <div className="flex flex-col items-center my-auto">
                        <EggAvatar
                          egg={egg}
                          size="md"
                          isCracking={isReady}
                          onClick={() => {
                            if (isReady) startHatchingProcess(slot.id, egg);
                          }}
                        />
                        <div className="text-center mt-3">
                          <div className="font-bold text-sm text-white">{egg.name}</div>
                          <div className="text-[11px] text-white/40 capitalize font-mono">{egg.rarity}</div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setSelectedSlotForPlacement(slot.id)}
                        className="my-auto flex flex-col items-center justify-center p-6 cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 group-hover:border-orange-400 flex items-center justify-center text-white/40 group-hover:text-orange-400 transition-colors mb-2">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-white/40 group-hover:text-white/80 font-mono">
                          Inserir Ovo
                        </span>
                      </div>
                    )}

                    {/* Slot Footer Controls */}
                    {egg ? (
                      <div className="w-full mt-3 space-y-2">
                        {isReady ? (
                          <button
                            onClick={() => startHatchingProcess(slot.id, egg)}
                            className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white font-mono font-bold text-xs rounded-lg shadow uppercase tracking-wider animate-pulse"
                          >
                            ✨ Chocar Agora!
                          </button>
                        ) : (
                          <>
                            {/* Progress bar */}
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-300"
                                style={{
                                  width: `${
                                    ((egg.hatchDurationSeconds - egg.timeRemaining) /
                                      egg.hatchDurationSeconds) *
                                    100
                                  }%`
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-white/50 font-mono">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {egg.timeRemaining}s restantes
                              </span>
                            </div>

                            {/* Accelerate options */}
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <button
                                onClick={() => handleAccelerateWithMagma(slot.id)}
                                className="py-1.5 px-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors"
                                title="Use o calor do seu Titã de Magma para acelerar 15s"
                              >
                                <Flame className="w-3 h-3 text-orange-400" /> Calor Magma (-15s)
                              </button>
                              <button
                                onClick={() => handleInstantHatch(slot.id)}
                                className="py-1.5 px-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors"
                                title="Chocar imediatamente"
                              >
                                <Cpu className="w-3 h-3 text-cyan-400" /> Chocar Já
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedSlotForPlacement(slot.id)}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-mono rounded-lg transition-colors"
                      >
                        Selecionar Ovo
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Egg Inventory Drawer/Selector */}
          <div className="border-t border-white/10 pt-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/80 mb-3">
              Inventário de Ovos Coletados nos Biomas ({eggInventory.length})
            </h3>

            {eggInventory.length === 0 ? (
              <div className="bg-[#111114] rounded-xl p-6 text-center border border-white/10 text-white/50 text-xs">
                Nenhum ovo no inventário no momento.
                <div className="text-[11px] text-orange-400 mt-1 font-mono">
                  💡 Explore os biomas (especialmente o <strong>Bioma Robótico</strong>, que possui os melhores ninhos) para coletar ovos raros!
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {eggInventory.map(egg => (
                  <div
                    key={egg.id}
                    className={`bg-[#111114] border rounded-xl p-3 flex flex-col items-center justify-between text-center transition-all ${
                      egg.isSecretIslandExclusive
                        ? 'border-amber-500/70 bg-gradient-to-b from-[#1a1528] to-[#111114] shadow-md shadow-amber-500/20'
                        : egg.isRoboticApex 
                        ? 'border-cyan-500/50 shadow-md shadow-cyan-500/10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <EggAvatar egg={egg} size="sm" />
                    <div className="w-full mt-2">
                      <div className="text-xs font-bold text-white truncate">{egg.name}</div>
                      <div className="text-[10px] text-white/40 capitalize font-mono">{egg.rarity}</div>
                      {egg.isSecretIslandExclusive && (
                        <div className="text-[9px] text-amber-300 font-mono font-bold mt-0.5 flex items-center justify-center gap-1">
                          <span>🏝️</span> Ilha Secreta
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const targetSlot =
                          selectedSlotForPlacement ||
                          slots.find(s => !s.egg)?.id;
                        if (targetSlot) {
                          onPlaceEgg(targetSlot, egg);
                          setSelectedSlotForPlacement(null);
                          soundFx.playClick();
                        }
                      }}
                      className="w-full mt-2 py-1 bg-white/5 hover:bg-white/10 text-orange-300 border border-orange-500/30 rounded text-xs font-mono font-bold transition-colors"
                    >
                      Incubar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hatching Screen Modal */}
      {hatchingEgg && (
        <HatchScreen
          egg={hatchingEgg.egg}
          onComplete={newDragon => {
            onEggHatched(hatchingEgg.slotId, newDragon);
            setHatchingEgg(null);
          }}
          onCancel={() => setHatchingEgg(null)}
        />
      )}
    </div>
  );
};
