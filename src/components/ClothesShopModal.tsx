import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  Shield,
  Palette,
  X,
  Crown,
  Shirt,
  Wind
} from 'lucide-react';
import {
  RiderClothingItem,
  RiderCustomizationOptions,
  RiderCustomizationState
} from '../types';
import {
  FREE_OUTFITS,
  FREE_HELMETS,
  FREE_CAPES,
  FREE_COLOR_DYES,
  FREE_GLOW_DYES
} from '../data/riderOutfits';

interface ClothesShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  customizationState: RiderCustomizationState;
  onApplyCustomization: (newOptions: Partial<RiderCustomizationOptions>, outfitId?: string, helmetId?: string, capeId?: string) => void;
  onPlaySound?: () => void;
}

export const ClothesShopModal: React.FC<ClothesShopModalProps> = ({
  isOpen,
  onClose,
  customizationState,
  onApplyCustomization,
  onPlaySound
}) => {
  const [activeTab, setActiveTab] = useState<'outfits' | 'helmets' | 'capes' | 'colors'>('outfits');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEquipOutfit = (item: RiderClothingItem) => {
    onPlaySound?.();
    onApplyCustomization(item.properties, item.id, item.properties.helmetStyle ? `helm_${item.properties.helmetStyle}` : undefined, item.properties.capeStyle ? `cape_${item.properties.capeStyle}` : undefined);
    setSuccessToast(`Traje "${item.name}" equipado com sucesso!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleEquipHelmet = (item: RiderClothingItem) => {
    onPlaySound?.();
    onApplyCustomization(item.properties, undefined, item.id, undefined);
    setSuccessToast(`${item.name} equipado!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleEquipCape = (item: RiderClothingItem) => {
    onPlaySound?.();
    onApplyCustomization(item.properties, undefined, undefined, item.id);
    setSuccessToast(`${item.name} equipada!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleApplyColorDye = (colorHex: string, type: 'armor' | 'glow' | 'cape') => {
    onPlaySound?.();
    if (type === 'armor') {
      onApplyCustomization({ armorColor: colorHex });
      setSuccessToast('Tinta de armadura aplicada!');
    } else if (type === 'glow') {
      onApplyCustomization({ visorGlowColor: colorHex });
      setSuccessToast('Luz do visor personalizada!');
    } else if (type === 'cape') {
      onApplyCustomization({ capeColor: colorHex });
      setSuccessToast('Cor da capa tingida!');
    }
    setTimeout(() => setSuccessToast(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#111116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-sans text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-950/40 via-amber-950/20 to-black/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white">
                  Loja de Roupas dos Condutores
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> 100% Grátis
                </span>
              </div>
              <p className="text-xs text-white/50">
                Personaliza a aparência do teu condutor 3D tanto a pé quanto montado no dragão!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar Loja"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-black/40 border-b border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('outfits')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
              activeTab === 'outfits'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Trajes Completos</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-md">{FREE_OUTFITS.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('helmets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
              activeTab === 'helmets'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Elmos & Chapéus</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-md">{FREE_HELMETS.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('capes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
              activeTab === 'capes'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>Capas Místicas</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-md">{FREE_CAPES.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
              activeTab === 'colors'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Tintas & Luzes</span>
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* SUCCESS NOTIFICATION TOAST */}
          {successToast && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono animate-in slide-in-from-top duration-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* TAB 1: TRAJES COMPLETOS */}
          {activeTab === 'outfits' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {FREE_OUTFITS.map(item => {
                const isEquipped = customizationState.equippedOutfitId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all ${
                      isEquipped
                        ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-500/10'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Top Row */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: item.previewColor }}
                        >
                          <Shield className="w-4 h-4 text-white drop-shadow" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                              {item.badge}
                            </span>
                          )}
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            GRÁTIS
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                      <p className="text-xs text-white/50 leading-relaxed mb-4">{item.description}</p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleEquipOutfit(item)}
                      disabled={isEquipped}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isEquipped
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 cursor-default'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Equipado</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Equipar Grátis</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ELMOS & CHAPÉUS */}
          {activeTab === 'helmets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {FREE_HELMETS.map(item => {
                const isEquipped = customizationState.equippedHelmetId === item.id || 
                  customizationState.currentOptions.helmetStyle === item.properties.helmetStyle;
                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all ${
                      isEquipped
                        ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-500/10'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: item.previewColor }}
                        >
                          <Crown className="w-4 h-4 text-white drop-shadow" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          GRÁTIS
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                      <p className="text-xs text-white/50 leading-relaxed mb-4">{item.description}</p>
                    </div>

                    <button
                      onClick={() => handleEquipHelmet(item)}
                      disabled={isEquipped}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isEquipped
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 cursor-default'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Equipado</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Equipar Grátis</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: CAPAS MÍSTICAS */}
          {activeTab === 'capes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {FREE_CAPES.map(item => {
                const isEquipped = customizationState.equippedCapeId === item.id ||
                  (item.properties.capeStyle === 'none' && customizationState.currentOptions.capeStyle === 'none') ||
                  (item.properties.capeColor && customizationState.currentOptions.capeColor === item.properties.capeColor);
                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all ${
                      isEquipped
                        ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-500/10'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: item.previewColor }}
                        >
                          <Wind className="w-4 h-4 text-white drop-shadow" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          GRÁTIS
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                      <p className="text-xs text-white/50 leading-relaxed mb-4">{item.description}</p>
                    </div>

                    <button
                      onClick={() => handleEquipCape(item)}
                      disabled={isEquipped}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isEquipped
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 cursor-default'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Equipado</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Equipar Grátis</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: TINTAS & LUZES */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Tintas de Armadura */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" />
                    Tintas de Metal & Armadura (100% Grátis)
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">Sem Custo</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {FREE_COLOR_DYES.map(dye => {
                    const isCurrent = customizationState.currentOptions.armorColor === dye.hex;
                    return (
                      <button
                        key={dye.id}
                        onClick={() => handleApplyColorDye(dye.hex, 'armor')}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                          isCurrent
                            ? 'bg-purple-950/40 border-purple-400 text-white shadow-md'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-white/70 hover:text-white'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-lg border border-white/20 shadow-inner shrink-0"
                          style={{ backgroundColor: dye.hex }}
                        />
                        <div className="truncate text-xs font-mono font-bold">
                          {dye.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cores da Luz do Visor */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Luz Mística do Visor / Olhos (100% Grátis)
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">Sem Custo</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {FREE_GLOW_DYES.map(glow => {
                    const isCurrent = customizationState.currentOptions.visorGlowColor === glow.hex;
                    return (
                      <button
                        key={glow.id}
                        onClick={() => handleApplyColorDye(glow.hex, 'glow')}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                          isCurrent
                            ? 'bg-purple-950/40 border-purple-400 text-white shadow-md'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-white/70 hover:text-white'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-lg border border-white/20 shadow-lg shrink-0"
                          style={{ backgroundColor: glow.hex, boxShadow: `0 0 10px ${glow.hex}` }}
                        />
                        <div className="truncate text-xs font-mono font-bold">
                          {glow.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-black/50 text-xs font-mono text-white/50">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Todas as roupas são gratuitas para todos os condutores.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
          >
            Concluir & Voltar ao Mundo 3D
          </button>
        </div>
      </div>
    </div>
  );
};
