import React, { useState } from 'react';
import { Biome, Dragon, Egg, WildGuardian } from '../types';
import { BIOMES, generateEggFromBiome } from '../data/biomes';
import { DragonAvatar } from './DragonAvatar';
import { EggAvatar } from './EggAvatar';
import { soundFx } from '../utils/audio';
import { 
  Waves, 
  Trees, 
  Cpu, 
  Snowflake, 
  Skull, 
  Sun, 
  Compass, 
  Sparkles, 
  Swords, 
  ShieldAlert, 
  Check, 
  ArrowLeft 
} from 'lucide-react';

interface BiomeExplorerProps {
  activeDragon: Dragon;
  onCollectEgg: (egg: Egg) => void;
  onStartBattle: (guardian: WildGuardian, biome: Biome) => void;
  onReturnToBase: () => void;
}

export const BiomeExplorer: React.FC<BiomeExplorerProps> = ({
  activeDragon,
  onCollectEgg,
  onStartBattle,
  onReturnToBase
}) => {
  const [selectedBiome, setSelectedBiome] = useState<Biome>(
    BIOMES.find(b => b.id === 'robotico') || BIOMES[0] // Highlight the best one first!
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [discoveredNest, setDiscoveredNest] = useState<{
    biomeId: string;
    eggs: Egg[];
    guardian?: WildGuardian;
  } | null>(null);
  const [collectedEggsIds, setCollectedEggsIds] = useState<string[]>([]);

  const biomeColors: Record<string, { dot: string; text: string; border: string; bg: string }> = {
    aquatico: { dot: 'bg-blue-400', text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-950/20' },
    floresta: { dot: 'bg-emerald-400', text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/20' },
    robotico: { dot: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]', text: 'text-cyan-300 font-bold', border: 'border-cyan-500/50', bg: 'bg-cyan-950/30' },
    neve: { dot: 'bg-slate-200', text: 'text-slate-100', border: 'border-slate-400/30', bg: 'bg-slate-900/30' },
    pantano: { dot: 'bg-purple-400', text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-950/20' },
    planicie: { dot: 'bg-amber-400', text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/20' }
  };

  const handleSelectBiome = (biome: Biome) => {
    setSelectedBiome(biome);
    setDiscoveredNest(null);
    soundFx.playClick();
  };

  const handleSearchBiome = () => {
    setIsSearching(true);
    soundFx.playRoar(activeDragon.element);

    setTimeout(() => {
      const numEggs = selectedBiome.id === 'robotico' ? 3 : Math.floor(Math.random() * 2) + 1;
      const eggs: Egg[] = [];
      for (let i = 0; i < numEggs; i++) {
        eggs.push(generateEggFromBiome(selectedBiome.id));
      }

      const guardian = selectedBiome.enemies[Math.floor(Math.random() * selectedBiome.enemies.length)];

      setDiscoveredNest({
        biomeId: selectedBiome.id,
        eggs,
        guardian
      });
      setIsSearching(false);
      soundFx.playVictory();
    }, 1200);
  };

  const handleCollect = (egg: Egg) => {
    soundFx.playClick();
    onCollectEgg(egg);
    setCollectedEggsIds(prev => [...prev, egg.id]);
  };

  return (
    <div className="space-y-6">
      {/* Top Biome Selector Bar */}
      <div className="bg-[#111114] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToBase}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Base
          </button>
          <div>
            <h2 className="text-xl font-light tracking-wide text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-orange-400" />
              Expedições aos <span className="font-serif italic text-orange-400 font-normal">6 Biomas</span>
            </h2>
            <p className="text-xs text-white/50">
              Explore os habitats, descubra ninhos selvagens e colete ovos raros para incubar na base.
            </p>
          </div>
        </div>

        {/* Active Companion Dragon */}
        <div className="flex items-center gap-3 bg-[#0d0d10] border border-white/10 px-3.5 py-2 rounded-xl">
          <div className="w-9 h-9 shrink-0">
            <DragonAvatar dragon={activeDragon} size="sm" showAura={false} />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white font-mono">
              {activeDragon.name.split(',')[0]}
            </div>
            <div className="text-[10px] text-orange-400 font-mono uppercase">
              {activeDragon.isTitanPermanent ? '★ Titã Combatente' : `Nível ${activeDragon.level}`}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Biomes Carousel Tabs - Sleek Sophisticated Dark Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {BIOMES.map(biome => {
          const isSelected = selectedBiome.id === biome.id;
          const styling = biomeColors[biome.id] || { dot: 'bg-white', text: 'text-white', border: 'border-white/10', bg: 'bg-white/5' };
          const isRobotic = biome.id === 'robotico';

          return (
            <button
              key={biome.id}
              onClick={() => handleSelectBiome(biome)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-orange-500/80 bg-white/10 shadow-lg shadow-orange-950/20'
                  : isRobotic
                  ? 'border-cyan-500/40 bg-cyan-950/20 hover:border-cyan-500/70'
                  : 'border-white/5 bg-[#0d0d10] hover:bg-white/5 hover:border-white/20'
              }`}
            >
              {/* Highlight ribbon for Robotic biome */}
              {biome.isBestNestBiome && (
                <span className="absolute top-1 right-1 bg-cyan-500 text-slate-950 font-mono font-bold text-[8px] px-1.5 py-0.2 rounded uppercase tracking-wider shadow">
                  Melhores Ninhos
                </span>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${styling.dot} shrink-0`} />
                <span className={`font-mono text-xs ${styling.text}`}>
                  {biome.name}
                </span>
              </div>

              <div className="text-[10px] text-white/40 line-clamp-1 font-mono">
                {biome.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Biome Stage View */}
      <div className="bg-[radial-gradient(circle_at_center,_#1a1a20_0%,_#0a0a0c_100%)] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div
          className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: selectedBiome.accentColor }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 text-white/90 border border-white/15">
                {selectedBiome.name}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                selectedBiome.isBestNestBiome 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 animate-pulse' 
                  : 'bg-white/5 text-orange-400 border border-orange-500/30'
              }`}>
                {selectedBiome.nestQualityLabel}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-light text-white">
              {selectedBiome.name}: <span className="font-serif italic text-white/90 font-normal">{selectedBiome.tagline}</span>
            </h3>
            <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
              {selectedBiome.description}
            </p>

            {/* Quote Card matching Sophisticated Dark design */}
            {selectedBiome.isBestNestBiome && (
              <div className="mt-3 bg-white/5 border border-cyan-500/30 p-2.5 rounded-lg text-xs text-cyan-300 italic font-mono flex items-center gap-2 max-w-xl">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>"Os ninhos do bioma robótico produzem as cascas mais blindadas da nova geração dracônica."</span>
              </div>
            )}
          </div>

          <button
            disabled={isSearching}
            onClick={handleSearchBiome}
            className={`px-7 py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider shadow-2xl transition-all active:scale-95 flex items-center gap-2 shrink-0 ${
              isSearching
                ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                : 'bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white shadow-orange-950/60'
            }`}
          >
            {isSearching ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-orange-400" />
                Rastreando Ninhos...
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                Explorar & Descobrir Ninho
              </>
            )}
          </button>
        </div>

        {/* Dynamic Biome Exploration Stage / Discovered Nest */}
        <div className="mt-8 relative z-10">
          {discoveredNest ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              {/* Nest Presentation Box */}
              <div className="bg-[#0d0d10] border border-amber-500/30 rounded-2xl p-6 backdrop-blur-md shadow-xl shadow-amber-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 👑 NINHO TITÃ SUPREMO ENCONTRADO!
                    </span>
                    <h4 className="text-lg sm:text-xl font-serif italic text-white mt-1">
                      {selectedBiome.isBestNestBiome
                        ? '👑 Ninho Mecha-Apex de Ovos Titãs'
                        : `👑 Ninho Titã Ancestral do ${selectedBiome.name}`}
                    </h4>
                    <p className="text-xs text-amber-200/70">
                      100% Garantido: Todos os ovos neste ninho são da lendária raridade TITÃ!
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-red-950/60 to-amber-950/60 border border-amber-500/50 text-amber-300 text-xs px-3 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    👑 100% Ovos Titãs Supremos
                  </div>
                </div>

                {/* Eggs in the nest */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                  {discoveredNest.eggs.map(egg => {
                    const isCollected = collectedEggsIds.includes(egg.id);

                    return (
                      <div
                        key={egg.id}
                        className={`p-5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                          isCollected
                            ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70'
                            : 'bg-gradient-to-b from-amber-950/20 to-[#111114] border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-400'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between text-[10px] font-mono mb-2">
                          <span className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded border border-amber-300 shadow">
                            👑 TITÃ
                          </span>
                          {egg.isRoboticApex && (
                            <span className="text-cyan-400 font-bold uppercase">Apex Tech</span>
                          )}
                        </div>

                        <div className="my-3">
                          <EggAvatar egg={egg} size="md" />
                        </div>

                        <div className="w-full mb-3">
                          <div className="font-bold text-sm text-white truncate">{egg.name}</div>
                          <div className="text-[11px] text-amber-200/60 mt-0.5 font-mono">
                            Tempo de choca: {egg.hatchDurationSeconds}s • Eclode Dragão Titã
                          </div>
                        </div>

                        {isCollected ? (
                          <div className="w-full py-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1">
                            <Check className="w-4 h-4" /> Coletado para a Base
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCollect(egg)}
                            className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-orange-950/50 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <span>👑 Coletar Ovo Titã</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wild Guardian of the Biome Encounter */}
              {discoveredNest.guardian && (
                <div className="bg-[#111114] border border-red-500/30 rounded-2xl p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 shrink-0">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
                          Guardião Territorial
                        </span>
                        <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded font-mono">
                          Nível {discoveredNest.guardian.level}
                        </span>
                      </div>
                      <h4 className="text-lg font-serif italic text-white mt-0.5">
                        {discoveredNest.guardian.name}
                      </h4>
                      <p className="text-xs text-white/50 mt-1 max-w-md">
                        {discoveredNest.guardian.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (discoveredNest.guardian) {
                        onStartBattle(discoveredNest.guardian, selectedBiome);
                        soundFx.playRoar(activeDragon.element);
                      }
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
                  >
                    <Swords className="w-4 h-4" /> Batalhar com {activeDragon.name.split(',')[0]}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Initial Biome Prompt */
            <div className="bg-[#0d0d10]/60 border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
              <Compass className="w-10 h-10 text-white/30 mb-3 animate-pulse" />
              <h4 className="text-base font-serif italic text-white mb-1">
                Território Dracônico Pronto para Exploração
              </h4>
              <p className="text-xs text-white/50 max-w-md mb-5">
                Clique no botão "Explorar & Descobrir Ninho" acima para rastrear o ninho de dragões oculto neste bioma.
              </p>
              <button
                onClick={handleSearchBiome}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-orange-500/40 text-orange-400 font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                Rastrear Ninho Agora
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Secret Island Mystery Hint Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-[#0d0d10] border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xl shrink-0">
            🏝️
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
              <span>✨</span> Ilha Secreta Perdida: Vila Ancestral & Bioma Negro
            </div>
            <p className="text-xs text-white/70 mt-0.5">
              Os ovos sagrados da <strong>Vila Ancestral</strong> e do <strong>Bioma Negro</strong> não podem ser obtidos em menus: 
              só podem ser coletados pessoalmente no <strong>Mundo 3D</strong> através da passagem secreta oculta na montanha do bioma de neve!
            </p>
          </div>
        </div>
        <button
          onClick={onReturnToBase}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-400/40 text-amber-200 text-xs font-mono font-bold transition-all shrink-0 flex items-center justify-center gap-1.5"
        >
          <Compass className="w-3.5 h-3.5" /> Ir ao Mundo 3D
        </button>
      </div>
    </div>
  );
};
