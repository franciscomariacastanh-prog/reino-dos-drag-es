import React from 'react';
import { 
  Crown, 
  Sparkles, 
  Flame, 
  Shield, 
  Zap, 
  Egg as EggIcon, 
  Coins, 
  X, 
  Check, 
  UserCheck, 
  Rocket,
  Lock,
  Globe
} from 'lucide-react';
import { Dragon, Egg } from '../types';
import { 
  getCreatorExclusiveDragons, 
  getCreatorExclusiveEggs, 
  getCreatorRemoteSecretIslandEggs,
  MASTER_CREATOR_NAME, 
  MASTER_CREATOR_EMAIL 
} from '../data/creatorPerks';
import { soundFx } from '../utils/audio';

interface CreatorPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreatorMode: boolean;
  onToggleCreatorMode: () => void;
  onAddDragons: (dragons: Dragon[]) => void;
  onAddEggs: (eggs: Egg[]) => void;
  onBuffActiveDragon: () => void;
  onMaxCurrencies: () => void;
  activeDragon: Dragon;
  onlinePlayersCount: number;
  currentRoom: string;
  onChangeRoom: (room: string) => void;
}

export const CreatorPanelModal: React.FC<CreatorPanelModalProps> = ({
  isOpen,
  onClose,
  isCreatorMode,
  onToggleCreatorMode,
  onAddDragons,
  onAddEggs,
  onBuffActiveDragon,
  onMaxCurrencies,
  activeDragon,
  onlinePlayersCount,
  currentRoom,
  onChangeRoom
}) => {
  if (!isOpen) return null;

  const handleUnlockAllDragons = () => {
    soundFx.playRoar('magma');
    const newDragons = getCreatorExclusiveDragons();
    onAddDragons(newDragons);
  };

  const handleGiveInstantEggs = () => {
    soundFx.playVictory();
    const newEggs = getCreatorExclusiveEggs();
    onAddEggs(newEggs);
  };

  const handleRemoteCollectSecretIslandEggs = () => {
    soundFx.playVictory();
    const secretEggs = getCreatorRemoteSecretIslandEggs();
    onAddEggs(secretEggs);
  };

  const handleBuffStats = () => {
    soundFx.playFire();
    onBuffActiveDragon();
  };

  const handleMaxCurrencies = () => {
    soundFx.playGemCollect();
    onMaxCurrencies();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-[#0f0e13] border-2 border-amber-500/60 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] font-sans text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-[#0f0e13] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Crown className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-mono tracking-tight text-amber-300">
                  Painel do Criador Titã
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Apenas para Mim
                </span>
              </div>
              <p className="text-xs text-amber-200/70 font-mono mt-0.5">
                Utilizador: <strong className="text-white">{MASTER_CREATOR_NAME}</strong> ({MASTER_CREATOR_EMAIL})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider font-mono text-amber-400 font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Status de Acesso Exclusivo
              </div>
              <div className="text-sm font-semibold text-white mt-1">
                {isCreatorMode 
                  ? '✨ TUDO 100% GRÁTIS ATIVADO APENAS PARA FRANCISCO' 
                  : '🔒 Modo Visitante Ativo (Preços e Esperas Normais)'}
              </div>
              <div className="text-xs text-white/60 mt-0.5">
                {isCreatorMode 
                  ? 'Todos os dragões, armaduras, roupas, ovos instantâneos e poderes de criador estão desbloqueados.'
                  : 'Outros jogadores têm restrições normais de progressão e incubação.'}
              </div>
            </div>

            <button
              onClick={onToggleCreatorMode}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all shrink-0 flex items-center gap-2 border ${
                isCreatorMode
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              {isCreatorMode ? <Lock className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5 text-amber-400" />}
              {isCreatorMode ? 'Alternar p/ Visitante' : 'Ativar Modo Francisco'}
            </button>
          </div>

          {/* Exclusive Creator Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Ações Rápidas de Criador Titã
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Unlock All Dragons */}
              <button
                onClick={handleUnlockAllDragons}
                disabled={!isCreatorMode}
                className="p-4 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/50 transition-all text-left group flex items-start gap-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-600/30 border border-orange-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300">
                    Desbloquear Dragões Deuses
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    Adiciona 4 Dragões Titãs Nível 100 com armaduras completas ao teu esquadrão.
                  </div>
                </div>
              </button>

              {/* Instant 0s Eggs */}
              <button
                onClick={handleGiveInstantEggs}
                disabled={!isCreatorMode}
                className="p-4 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/50 transition-all text-left group flex items-start gap-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <EggIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300">
                    6 Ovos Titânicos Instantâneos
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    Gera ovos com tempo 0s de choco na tua incubadora grátis.
                  </div>
                </div>
              </button>

              {/* Titan God Buff */}
              <button
                onClick={handleBuffStats}
                disabled={!isCreatorMode}
                className="p-4 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/50 transition-all text-left group flex items-start gap-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300">
                    Poder Supremo do Titã
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    +99,999 HP, +9,999 ATK e velocidade máxima no dragão ativo ({activeDragon.name}).
                  </div>
                </div>
              </button>

              {/* Infinite Currencies */}
              <button
                onClick={handleMaxCurrencies}
                disabled={!isCreatorMode}
                className="p-4 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/50 transition-all text-left group flex items-start gap-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Coins className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-300">
                    Essência & Sucata Infinitas
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    Define 9,999,999 de Essência Dracônica e Sucata Apex no inventário.
                  </div>
                </div>
              </button>

              {/* Exclusive Remote Secret Island Eggs (Vila Ancestral, Bioma Negro e Bioma Elétrico) */}
              <button
                onClick={handleRemoteCollectSecretIslandEggs}
                disabled={!isCreatorMode}
                className="col-span-1 sm:col-span-2 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-cyan-950/40 hover:from-amber-900/50 hover:via-purple-900/50 hover:to-cyan-900/50 border-2 border-amber-500/50 hover:border-cyan-400 transition-all text-left group flex items-start gap-3.5 shadow-lg shadow-cyan-950/40 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-purple-600 to-cyan-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-amber-300 group-hover:text-cyan-300">
                      ⚡ Coleta Remota: Ilha Secreta (3 Ovos Titãs)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      EXCLUSIVO FRANCISCO
                    </span>
                  </div>
                  <div className="text-xs text-white/80 mt-1">
                    Coleta instantânea à distância sem precisares de ir fisicamente à Ilha Secreta: <strong>Ovo da Vila Ancestral</strong>, <strong>Ovo do Bioma Negro</strong> e o novo <strong>Ovo do Bioma Elétrico</strong> com tempo 0s!
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Multiplayer Status in Creator Panel */}
          <div className="p-4 rounded-xl bg-[#16151c] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Rede Multiplayer Conectada
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {onlinePlayersCount} Online no Reino
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={currentRoom}
                onChange={(e) => onChangeRoom(e.target.value)}
                placeholder="Código da Sala..."
                className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => onChangeRoom(currentRoom)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold hover:bg-amber-500/30"
              >
                Mudar Sala
              </button>
            </div>
            <p className="text-[11px] text-white/50">
              No mundo 3D, outros jogadores veem a tua <strong>Coroa de Criador Titã Dourada</strong> e a tua aura lendária em tempo real!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#111116] flex items-center justify-between">
          <div className="text-[11px] text-amber-400/80 font-mono">
            🛡️ Protegido para {MASTER_CREATOR_EMAIL}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold font-mono text-xs hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
          >
            Confirmar & Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
