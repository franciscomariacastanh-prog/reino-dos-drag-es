import React, { useState } from 'react';
import { Dragon, Egg, IncubatorSlot, DragonSkinStyle } from '../types';
import { DragonAvatar } from './DragonAvatar';
import { EggAvatar } from './EggAvatar';
import { DragonSkinModal } from './DragonSkinModal';
import { getDefaultSkinForElement, getSkinDefinition } from '../data/dragonSkins';
import { soundFx } from '../utils/audio';
import { 
  Flame, 
  Compass, 
  Shield, 
  Sparkles, 
  Layers, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Heart, 
  Zap, 
  Cpu,
  Wind,
  Crown,
  Globe,
  Palette
} from 'lucide-react';

interface DragonSanctuaryProps {
  dragons: Dragon[];
  activeDragonId: string;
  eggInventory: Egg[];
  incubatorSlots: IncubatorSlot[];
  onSelectActiveDragon: (id: string) => void;
  onOpenBiomeMap: () => void;
  onOpenArmory: () => void;
  onOpenIncubator: () => void;
  onOpenDragonCollection: () => void;
  onOpen3DWorld: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isCreatorMode?: boolean;
  onOpenCreatorPanel?: () => void;
  onlinePlayersCount?: number;
  onUpdateDragonSkin?: (dragonId: string, skinStyle: DragonSkinStyle, customColors?: { primary: string; secondary: string; emissive: string }) => void;
}

export const DragonSanctuary: React.FC<DragonSanctuaryProps> = ({
  dragons,
  activeDragonId,
  eggInventory,
  incubatorSlots,
  onSelectActiveDragon,
  onOpenBiomeMap,
  onOpenArmory,
  onOpenIncubator,
  onOpenDragonCollection,
  onOpen3DWorld,
  isMuted,
  onToggleMute,
  isCreatorMode = false,
  onOpenCreatorPanel,
  onlinePlayersCount = 1,
  onUpdateDragonSkin
}) => {
  const [showSkinModal, setShowSkinModal] = useState<boolean>(false);
  const activeDragon = dragons.find(d => d.id === activeDragonId) || dragons[0];
  const magmaTitan = dragons.find(d => d.isTitanPermanent) || dragons[0];
  const currentSkinStyle = activeDragon.visual?.skinStyle || getDefaultSkinForElement(activeDragon.element);
  const currentSkinDef = getSkinDefinition(currentSkinStyle);

  const readyEggsCount = incubatorSlots.filter(s => s.egg && s.egg.timeRemaining <= 0).length;

  return (
    <div className="space-y-6">
      {/* Exclusive Creator & Multiplayer Status Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#121118] to-purple-950/30 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Crown className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-amber-300">
                {isCreatorMode ? '👑 FRANCISCO MARIA • CRIADOR TITÃ SUPREMO' : 'MODO VISITANTE'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {isCreatorMode ? '✨ TUDO 100% GRÁTIS ATIVADO' : 'Restrições Padrão'}
              </span>
            </div>
            <div className="text-[11px] text-white/60 font-mono mt-0.5">
              Email: <strong>franciscomariacastanh@gmail.com</strong> • Todos os dragões, ovos 0s e armaduras gratuitas
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{onlinePlayersCount} Online no Reino</span>
          </div>

          {onOpenCreatorPanel && (
            <button
              onClick={onOpenCreatorPanel}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Crown className="w-3.5 h-3.5 text-black" />
              <span>Painel Criador</span>
            </button>
          )}
        </div>
      </div>

      {/* Sanctuary Top Banner */}
      <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -left-20 top-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 bottom-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-2.5 py-0.5 bg-orange-600/20 border border-orange-500/50 text-orange-400 font-mono font-bold text-[10px] uppercase tracking-widest rounded flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Titã de Magma Permanente Ativo
              </span>
              <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-white/60 font-mono text-[10px] uppercase tracking-wider rounded">
                Santuário Central • 6 Biomas
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide text-white font-sans">
              Reino dos Dragões: <span className="font-serif italic text-orange-400 font-normal">Titã de Magma</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
              Comande seu titã primordial de fogo e explore os 6 biomas misteriosos (<strong>aquático, floresta, robótico, neve, pântano e planície</strong>). Colete ovos nos ninhos para chocar na base e equipe armaduras elementais gratuitas!
            </p>
          </div>

          {/* Sound Mute & Quick Stats */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={onOpen3DWorld}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-950/50 transition-all active:scale-95 border border-orange-400/40 animate-pulse"
            >
              <Wind className="w-4 h-4 text-orange-200" />
              <span>Jogar Mundo 3D</span>
            </button>

            <button
              onClick={onToggleMute}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-colors flex items-center gap-2 text-xs font-mono"
              title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
              <span>{isMuted ? 'Mudo' : 'Áudio'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Base Grid: Centerpiece Titan Showcase + Quick Access Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (5 cols): The Permanent Magma Titan Showcase with Radial Pulse and Equipment */}
        <div className="lg:col-span-5 bg-[radial-gradient(circle_at_center,_#1a1a20_0%,_#0a0a0c_100%)] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[480px]">
          {/* Concentric ambient glowing rings matching Sophisticated Dark design */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 sm:w-80 h-72 sm:h-80 rounded-full border border-orange-500/10 flex items-center justify-center">
              <div className="w-56 sm:w-64 h-56 sm:h-64 rounded-full border border-orange-500/20 flex items-center justify-center animate-pulse" />
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-[10px] font-mono mb-2 relative z-10">
            <span className="px-2 py-0.5 bg-orange-600/20 border border-orange-500/50 text-orange-500 font-bold uppercase tracking-widest rounded flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> Guardião Permanente
            </span>
            <span className="text-white/40 uppercase tracking-widest">
              RANK TITÃ • LVL {magmaTitan.level}
            </span>
          </div>

          {/* Avatar with burning glow */}
          <div className="my-4 relative z-10 flex items-center justify-center">
            <div className="rounded-full shadow-[0_0_80px_rgba(234,88,12,0.3)]">
              <DragonAvatar dragon={magmaTitan} size="xl" />
            </div>
          </div>

          <div className="w-full relative z-10">
            <h2 className="text-2xl sm:text-3xl font-serif italic text-white/90">
              {magmaTitan.name}
            </h2>
            <div className="text-[11px] text-orange-400 font-mono tracking-wider mt-1 mb-4 uppercase">
              "{magmaTitan.title}"
            </div>

            {/* Quick Equipment Preview Slots */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {(['elmo', 'peitoral', 'asas', 'garras'] as const).map(slot => {
                const equipped = magmaTitan.equippedArmor[slot];
                return (
                  <div
                    key={slot}
                    onClick={onOpenArmory}
                    title={equipped ? `${equipped.name} (${equipped.element})` : `Slot ${slot} vazio`}
                    className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all ${
                      equipped
                        ? 'bg-white/10 border-orange-500/60 text-orange-400 shadow-[0_0_10px_rgba(234,88,12,0.2)]'
                        : 'bg-[#1a1a20] border-white/10 text-white/30 hover:border-white/30'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 mb-0.5" />
                    <span className="text-[7px] uppercase font-mono tracking-tighter">
                      {slot.slice(0, 4)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Stats Bar (from design) */}
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl py-3 px-2 mb-4 flex items-center justify-around font-mono">
              <div className="text-center">
                <div className="text-[9px] uppercase text-white/40 tracking-wider">Vida</div>
                <div className="text-sm sm:text-base font-bold text-red-400">{magmaTitan.hp}</div>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="text-center">
                <div className="text-[9px] uppercase text-white/40 tracking-wider">Ataque</div>
                <div className="text-sm sm:text-base font-bold text-orange-500">{magmaTitan.atk}</div>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="text-center">
                <div className="text-[9px] uppercase text-white/40 tracking-wider">Defesa</div>
                <div className="text-sm sm:text-base font-bold text-white/90">{magmaTitan.def}</div>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="text-center">
                <div className="text-[9px] uppercase text-white/40 tracking-wider">Velocidade</div>
                <div className="text-sm sm:text-base font-bold text-cyan-400">{magmaTitan.spd}</div>
              </div>
            </div>

            {/* Skin Customizer Button */}
            <div className="mb-3 w-full">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowSkinModal(true);
                }}
                className="w-full py-2 bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-amber-500/15 hover:from-amber-500/25 hover:to-orange-500/30 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                title="Trocar e personalizar a skin 3D hiper-realista"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="truncate">Skin Realista: {currentSkinDef.name}</span>
              </button>
            </div>

            {/* Set Active / Status */}
            {activeDragonId === magmaTitan.id ? (
              <div className="w-full py-2 bg-orange-600/10 border border-orange-500/50 text-orange-400 font-mono font-bold text-[11px] uppercase tracking-widest rounded-lg">
                ★ Combatente Ativo Escolhido
              </div>
            ) : (
              <button
                onClick={() => {
                  onSelectActiveDragon(magmaTitan.id);
                  soundFx.playRoar(magmaTitan.element);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-orange-950/50 transition-all"
              >
                Definir Titã como Combatente Ativo
              </button>
            )}
          </div>
        </div>

        {/* Right Col (7 cols): Base Modules Grid */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Featured Card: Mundo 3D Dragon Adventures */}
          <div
            onClick={onOpen3DWorld}
            className="group bg-gradient-to-r from-[#18111e] via-[#1a1215] to-[#12161f] border border-orange-500/40 hover:border-orange-500 rounded-2xl p-5 shadow-2xl cursor-pointer transition-all hover:scale-[1.01] relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/50 text-orange-400 flex items-center justify-center shrink-0">
                  <Wind className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-orange-600/30 text-orange-400 border border-orange-500/50 rounded text-[9px] font-mono font-bold uppercase">
                      Modo 3D
                    </span>
                    <span className="text-[10px] font-mono text-white/50">Estilo Dragon Adventures</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors mt-0.5">
                    Mundo 3D: Voo Livre e Coleta nos Ninhos
                  </h3>
                  <p className="text-xs text-white/60 line-clamp-1">
                    Controle em 3ª pessoa com o seu dragão, voe pelos biomas, solte sopro de fogo e resgate ovos!
                  </p>
                </div>
              </div>
              <div className="shrink-0 px-3.5 py-2 rounded-xl bg-orange-600 group-hover:bg-orange-500 text-white font-mono text-xs font-bold flex items-center gap-1 shadow-lg">
                <span>Decolar 3D</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Explorar Biomas */}
          <div
            onClick={onOpenBiomeMap}
            className="group bg-[#0d0d10] border border-white/10 hover:border-cyan-500/50 rounded-2xl p-6 shadow-xl cursor-pointer transition-all hover:bg-white/[0.03] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-cyan-400 group-hover:border-cyan-500/50 group-hover:bg-cyan-950/20 flex items-center justify-center transition-colors">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">6 Biomas</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                Expedição aos Biomas
              </h3>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                Descubra ninhos selvagens nos biomas <strong>Áquatico, Floresta, Robótico, Neve, Pântano e Planície</strong>.
              </p>
              <div className="mt-3 p-2 rounded bg-cyan-950/20 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono flex items-center gap-1.5 font-bold">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Ninhos Robóticos possuem os melhores ovos Apex!</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
              <span>Explorar Agora</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Incubadora de Ovos */}
          <div
            onClick={onOpenIncubator}
            className="group bg-[#0d0d10] border border-white/10 hover:border-orange-500/50 rounded-2xl p-6 shadow-xl cursor-pointer transition-all hover:bg-white/[0.03] flex flex-col justify-between relative overflow-hidden"
          >
            {readyEggsCount > 0 && (
              <span className="absolute top-4 right-4 bg-orange-500 text-slate-950 text-[9px] font-mono font-bold px-2 py-0.5 rounded animate-bounce">
                {readyEggsCount} PRONTO!
              </span>
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-orange-400 group-hover:border-orange-500/50 group-hover:bg-orange-950/20 flex items-center justify-center transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                  {eggInventory.length} no Inventário
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                Câmara de Incubação
              </h3>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                Insira os ovos resgatados nas câmaras térmicas, aqueça com calor titânico e choque novos dragões.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-orange-400">
              <span>Gerenciar Incubadora</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Arsenal de Armaduras Grátis */}
          <div
            onClick={onOpenArmory}
            className="group bg-[#0d0d10] border border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 shadow-xl cursor-pointer transition-all hover:bg-white/[0.03] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-emerald-400 group-hover:border-emerald-500/50 group-hover:bg-emerald-950/20 flex items-center justify-center transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  100% Grátis
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                Armaduras Elementais
              </h3>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                Conjuntos completos de elmo, peitoral, asas e garras que fortificam dragões dos respetivos elementos.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
              <span>Abrir Armaria Grátis</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Coleção e Esquadrão Dracônico */}
          <div
            onClick={onOpenDragonCollection}
            className="group bg-[#0d0d10] border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 shadow-xl cursor-pointer transition-all hover:bg-white/[0.03] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-purple-400 group-hover:border-purple-500/50 group-hover:bg-purple-950/20 flex items-center justify-center transition-colors">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                  {dragons.length} Dragões
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                Esquadrão Dracônico
              </h3>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                Inspecione cada espécie descoberta, visualize ataques elementais e alterne o combatente ativo.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-purple-400">
              <span>Ver Esquadrão</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Quick Active Dragons Reel */}
      <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white/80">
              Dragões no Santuário ({dragons.length})
            </h3>
          </div>
          <button
            onClick={onOpenDragonCollection}
            className="text-xs font-mono text-orange-400 hover:underline flex items-center gap-1"
          >
            Ver Detalhes do Esquadrão <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dragons.map(dragon => {
            const isActive = dragon.id === activeDragonId;
            return (
              <div
                key={dragon.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-orange-950/10 border-orange-500/50 shadow-[0_0_15px_rgba(234,88,12,0.15)]'
                    : 'bg-[#111114] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-mono uppercase text-white/40 mb-2">
                  <span className="capitalize">{dragon.element}</span>
                  {dragon.isTitanPermanent ? (
                    <span className="bg-orange-600/20 text-orange-400 border border-orange-500/40 px-1.5 py-0.5 rounded font-bold">
                      Titã Permanente
                    </span>
                  ) : (
                    <span>Nível {dragon.level}</span>
                  )}
                </div>

                <div className="flex justify-center my-2">
                  <DragonAvatar dragon={dragon} size="sm" />
                </div>

                <div className="text-center mb-3">
                  <div className="font-bold text-sm text-white truncate">{dragon.name}</div>
                  <div className="text-[10px] text-white/40 capitalize font-mono">{dragon.species}</div>
                </div>

                {isActive ? (
                  <div className="w-full py-1.5 bg-orange-600/20 border border-orange-500/50 text-orange-400 font-mono font-bold text-[10px] uppercase tracking-wider rounded text-center">
                    Combatente Ativo
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onSelectActiveDragon(dragon.id);
                      soundFx.playRoar(dragon.element);
                    }}
                    className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 font-mono font-bold text-[10px] uppercase tracking-wider rounded transition-colors"
                  >
                    Tornar Ativo
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* REALISTIC DRAGON SKIN MODAL */}
      <DragonSkinModal
        dragon={activeDragon}
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
