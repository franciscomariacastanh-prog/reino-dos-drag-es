import React, { useState } from 'react';
import { Dragon, DragonSkinStyle } from '../types';
import { DRAGON_SKINS, DragonSkinDefinition, getSkinDefinition, getDefaultSkinForElement } from '../data/dragonSkins';
import { soundFx } from '../utils/audio';
import { 
  Sparkles, 
  X, 
  Check, 
  Palette, 
  ShieldCheck, 
  Zap, 
  Flame, 
  Eye, 
  Layers,
  ChevronRight
} from 'lucide-react';

interface DragonSkinModalProps {
  dragon: Dragon;
  isOpen: boolean;
  onClose: () => void;
  onEquipSkin: (dragonId: string, skinStyle: DragonSkinStyle, customColors?: { primary: string; secondary: string; emissive: string }) => void;
  isCreatorMode?: boolean;
}

export const DragonSkinModal: React.FC<DragonSkinModalProps> = ({
  dragon,
  isOpen,
  onClose,
  onEquipSkin,
  isCreatorMode = false
}) => {
  if (!isOpen) return null;

  const currentSkinStyle: DragonSkinStyle = dragon.visual.skinStyle || getDefaultSkinForElement(dragon.element);
  const currentSkinDef = getSkinDefinition(currentSkinStyle);

  const [selectedSkinId, setSelectedSkinId] = useState<DragonSkinStyle>(currentSkinStyle);
  const selectedDef = getSkinDefinition(selectedSkinId);

  const handleApply = (skin: DragonSkinDefinition) => {
    setSelectedSkinId(skin.id);
    onEquipSkin(dragon.id, skin.id, {
      primary: skin.primaryColor,
      secondary: skin.secondaryColor,
      emissive: skin.emissiveColor
    });
    soundFx.playPowerUp();
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'tita':
        return 'bg-gradient-to-r from-red-600 to-amber-600 text-amber-100 border-amber-400/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
      case 'lendario':
        return 'bg-gradient-to-r from-purple-600 to-amber-500 text-white border-purple-400/40';
      case 'epico':
        return 'bg-purple-900/60 text-purple-200 border-purple-500/40';
      default:
        return 'bg-emerald-950/60 text-emerald-200 border-emerald-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-[#0c0d12] border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-white/10 bg-[#11131a]/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  Skins Realistas do Dragão
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Hiper-Realismo 3D PBR
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                {dragon.name} • Elemento <span className="capitalize text-white/80">{dragon.element}</span> • Skin Ativa: <span className="text-amber-300 font-semibold">{currentSkinDef.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
            title="Fechar [ESC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content: Left Side Detail Showcase + Right Side Skin Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Selected Skin Deep Dive Card */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <div className="bg-[#141620] border border-white/10 rounded-xl p-4 sm:p-5 relative overflow-hidden flex-1 flex flex-col justify-between">
              {/* Glow accent in background */}
              <div 
                className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ backgroundColor: selectedDef.emissiveColor }}
              />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${getRarityBadge(selectedDef.rarity)}`}>
                    {selectedDef.rarity.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    {selectedDef.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {selectedDef.name}
                  </h3>
                  <p className="text-xs text-amber-300/80 font-mono mt-0.5">
                    {selectedDef.tagline}
                  </p>
                </div>

                {/* Color swatches */}
                <div className="bg-black/40 border border-white/10 rounded-lg p-3 space-y-2">
                  <div className="text-[11px] font-mono text-white/60 uppercase flex items-center justify-between">
                    <span>Paleta Dérmica PBR</span>
                    <span className="text-[10px] text-white/40">Relevo {Math.round(selectedDef.bumpScale * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-white/10">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: selectedDef.primaryColor }} />
                      <span className="text-[10px] font-mono text-white/70">Base</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-white/10">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: selectedDef.secondaryColor }} />
                      <span className="text-[10px] font-mono text-white/70">Escamas</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-white/10">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: selectedDef.emissiveColor, color: selectedDef.emissiveColor }} />
                      <span className="text-[10px] font-mono text-white/70">Luz</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  {selectedDef.description}
                </p>

                {/* Features List */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-2">
                    Características Anatômicas Realistas:
                  </div>
                  {selectedDef.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-white/80">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-white/10 relative z-10">
                {currentSkinStyle === selectedDef.id ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Skin Atualmente Equipada</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(selectedDef)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black text-xs font-mono font-bold shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Equipar Esta Skin Realista</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Grid of all realistic skins */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-white/50 px-1">
              <span>Catálogo de Texturas Dérmicas 3D ({DRAGON_SKINS.length})</span>
              <span className="text-amber-400/80">★ Todas as skins 100% liberadas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[560px] overflow-y-auto pr-1">
              {DRAGON_SKINS.map((skin) => {
                const isCurrent = currentSkinStyle === skin.id;
                const isSelected = selectedSkinId === skin.id;

                return (
                  <div
                    key={skin.id}
                    onClick={() => setSelectedSkinId(skin.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group ${
                      isSelected
                        ? 'bg-[#181a26] border-amber-500/80 ring-1 ring-amber-500/50 shadow-xl'
                        : isCurrent
                        ? 'bg-[#12141c] border-emerald-500/50 hover:border-emerald-500/80'
                        : 'bg-[#101118] border-white/10 hover:border-white/25 hover:bg-[#141620]'
                    }`}
                  >
                    {/* Top gradient badge banner */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]`} style={{ backgroundColor: skin.emissiveColor, color: skin.emissiveColor }} />
                          <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                            {skin.name}
                          </h4>
                        </div>
                        <p className="text-[11px] font-mono text-white/40 mt-0.5">
                          {skin.category}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${getRarityBadge(skin.rarity)}`}>
                          {skin.rarity}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Equipado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-xs text-white/60 line-clamp-2 mb-3">
                      {skin.tagline}
                    </p>

                    {/* Mini Swatches + Equip Button */}
                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: skin.primaryColor }} title="Cor Primária" />
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: skin.secondaryColor }} title="Escamas" />
                        <div className="w-3 h-3 rounded-full border border-white/20 shadow-[0_0_6px_currentColor]" style={{ backgroundColor: skin.emissiveColor, color: skin.emissiveColor }} title="Brilho Emissivo" />
                      </div>

                      {isCurrent ? (
                        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Ativa
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(skin);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/15 hover:border-amber-400/50 text-white/80 hover:text-amber-300 text-xs font-mono font-bold transition-all flex items-center gap-1"
                        >
                          <span>Equipar</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#0a0b10] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-white/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>As skins alteram o relevo PBR, brilho ocular, membranas de asas e escamas em tempo real.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 font-mono text-xs font-semibold transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
