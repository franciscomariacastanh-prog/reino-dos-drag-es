import React, { useState } from 'react';
import { Dragon, ArmorSlot, DragonSkinStyle } from '../types';
import { DragonAvatar } from './DragonAvatar';
import { DragonSkinModal } from './DragonSkinModal';
import { soundFx } from '../utils/audio';
import { 
  Shield, 
  Sparkles, 
  Zap, 
  Heart, 
  ArrowLeft, 
  Flame, 
  Layers, 
  Check, 
  ChevronRight,
  TrendingUp,
  Palette
} from 'lucide-react';

interface DragonManagerProps {
  dragons: Dragon[];
  activeDragonId: string;
  onSelectActiveDragon: (id: string) => void;
  onLevelUpDragon: (dragonId: string) => void;
  onOpenArmory: () => void;
  onClose: () => void;
  onUpdateDragonSkin?: (dragonId: string, skinStyle: DragonSkinStyle, customColors?: { primary: string; secondary: string; emissive: string }) => void;
  isCreatorMode?: boolean;
}

export const DragonManager: React.FC<DragonManagerProps> = ({
  dragons,
  activeDragonId,
  onSelectActiveDragon,
  onLevelUpDragon,
  onOpenArmory,
  onClose,
  onUpdateDragonSkin,
  isCreatorMode = false
}) => {
  const [selectedDragonId, setSelectedDragonId] = useState<string>(activeDragonId);
  const [showSkinModal, setShowSkinModal] = useState<boolean>(false);
  const selectedDragon = dragons.find(d => d.id === selectedDragonId) || dragons[0];
  const isActive = selectedDragon.id === activeDragonId;

  const slots: ArmorSlot[] = ['elmo', 'peitoral', 'asas', 'garras'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar à Base
          </button>
          <div>
            <h2 className="text-xl font-light text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              Esquadrão & <span className="font-serif italic text-orange-400 font-normal">Bestiário Dracônico</span> ({dragons.length})
            </h2>
            <p className="text-xs text-white/40 font-mono">
              Inspecione atributos, evolua seus dragões e organize seu time de batalha
            </p>
          </div>
        </div>

        <button
          onClick={onOpenArmory}
          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
        >
          <Shield className="w-4 h-4" /> Ajustar Armaduras Grátis
        </button>
      </div>

      {/* Main Container: Selector List + Detail Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Dragon List */}
        <div className="lg:col-span-4 space-y-2 max-h-[620px] overflow-y-auto pr-1">
          {dragons.map(dragon => {
            const isSel = dragon.id === selectedDragonId;
            const isCurActive = dragon.id === activeDragonId;

            return (
              <button
                key={dragon.id}
                onClick={() => {
                  setSelectedDragonId(dragon.id);
                  soundFx.playClick();
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSel
                    ? 'bg-white/[0.05] border-orange-400/80 ring-1 ring-orange-400/30 shadow-lg'
                    : 'bg-[#0d0d10] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0">
                    <DragonAvatar dragon={dragon} size="sm" showAura={false} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm text-white truncate max-w-[130px]">
                        {dragon.name.split(',')[0]}
                      </span>
                      {dragon.isTitanPermanent && (
                        <span className="bg-red-600/80 text-white text-[9px] font-mono font-bold px-1 rounded uppercase">
                          Titã
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/40 font-mono capitalize mt-0.5">
                      {dragon.element} • Nível {dragon.level}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isCurActive && (
                    <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full block mb-1">
                      Ativo
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Dragon Detail Showcase */}
        <div className="lg:col-span-8 bg-[#0d0d10] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Header info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="bg-white/5 border border-white/10 text-white/70 text-xs px-2.5 py-0.5 rounded-full font-mono uppercase">
                  Elemento: <strong className="text-orange-400">{selectedDragon.element}</strong>
                </span>
                <span className="bg-white/5 border border-white/10 text-white/70 text-xs px-2.5 py-0.5 rounded-full font-mono uppercase">
                  Raridade: <strong className="text-white">{selectedDragon.rarity}</strong>
                </span>
                {selectedDragon.isTitanPermanent && (
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> Titã Permanente Inicial
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-light text-white font-serif italic">
                {selectedDragon.name}
              </h3>
              <p className="text-xs text-orange-300/80 italic mt-0.5 font-serif">
                "{selectedDragon.title}"
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowSkinModal(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow"
                title="Personalizar Skin Realista 3D deste dragão"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Skin Realista</span>
              </button>

              {isActive ? (
                <div className="px-4 py-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 shrink-0">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Combatente Atual
                </div>
              ) : (
                <button
                  onClick={() => {
                    onSelectActiveDragon(selectedDragon.id);
                    soundFx.playRoar(selectedDragon.element);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl shadow transition-all active:scale-95 shrink-0"
                >
                  Definir como Ativo
                </button>
              )}
            </div>
          </div>

          {/* Dragon Visual & Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 flex justify-center">
              <DragonAvatar dragon={selectedDragon} size="lg" />
            </div>

            <div className="md:col-span-7 space-y-4">
              {/* Level & XP progression */}
              <div className="bg-[#0a0a0c] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-white/40 font-bold uppercase tracking-wider">
                    Nível do Dragão: <strong className="text-orange-400">{selectedDragon.level} / {selectedDragon.maxLevel}</strong>
                  </span>
                  <span className="text-white/40">
                    {selectedDragon.xp} / {selectedDragon.xpToNext} XP
                  </span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                    style={{
                      width: `${
                        selectedDragon.maxLevel === selectedDragon.level
                          ? 100
                          : Math.min(100, (selectedDragon.xp / (selectedDragon.xpToNext || 1)) * 100)
                      }%`
                    }}
                  />
                </div>

                <button
                  disabled={selectedDragon.level >= selectedDragon.maxLevel}
                  onClick={() => {
                    onLevelUpDragon(selectedDragon.id);
                    soundFx.playVictory();
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-700 to-blue-700 hover:from-indigo-600 hover:to-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <TrendingUp className="w-4 h-4" /> Treinar & Subir Nível (+Atributos)
                </button>
              </div>

              {/* Stats 4-Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0a0a0c] border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40 font-mono uppercase">Vida Máxima</div>
                    <div className="text-base font-bold text-white font-mono">{selectedDragon.hp}</div>
                  </div>
                </div>

                <div className="bg-[#0a0a0c] border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40 font-mono uppercase">Poder de Ataque</div>
                    <div className="text-base font-bold text-white font-mono">{selectedDragon.atk}</div>
                  </div>
                </div>

                <div className="bg-[#0a0a0c] border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40 font-mono uppercase">Armadura & Defesa</div>
                    <div className="text-base font-bold text-white font-mono">{selectedDragon.def}</div>
                  </div>
                </div>

                <div className="bg-[#0a0a0c] border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40 font-mono uppercase">Velocidade & Esquiva</div>
                    <div className="text-base font-bold text-white font-mono">{selectedDragon.spd}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Equipped Armor Summary */}
          <div className="bg-[#0a0a0c] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/60">
                Armaduras Elementais Atualmente Equipadas
              </span>
              <button
                onClick={onOpenArmory}
                className="text-xs font-mono text-emerald-400 hover:underline"
              >
                Trocar no Arsenal Grátis →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {slots.map(slot => {
                const piece = selectedDragon.equippedArmor[slot];
                return (
                  <div
                    key={slot}
                    className="bg-[#111114] border border-white/10 p-2.5 rounded-lg text-left text-xs font-mono"
                  >
                    <span className="text-[9px] text-white/40 uppercase block">{slot}</span>
                    {piece ? (
                      <div className="font-bold text-white/90 truncate mt-0.5">{piece.name}</div>
                    ) : (
                      <div className="text-white/30 italic mt-0.5">Sem peça</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dragon Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/60">
              Habilidades de Combate
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedDragon.skills.map(skill => (
                <div
                  key={skill.id}
                  className="bg-[#0a0a0c] border border-white/10 p-3 rounded-xl flex flex-col justify-between text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{skill.name}</span>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-orange-400 font-bold">
                      Poder: {skill.power}
                    </span>
                  </div>
                  <p className="text-white/40 text-[11px] mt-1">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* REALISTIC DRAGON SKIN MODAL */}
      <DragonSkinModal
        dragon={selectedDragon}
        isOpen={showSkinModal}
        onClose={() => setShowSkinModal(false)}
        onEquipSkin={(dragonId, skinStyle, customColors) => {
          if (onUpdateDragonSkin) {
            onUpdateDragonSkin(dragonId, skinStyle, customColors);
          }
        }}
        isCreatorMode={isCreatorMode}
      />
    </div>
  );
};
