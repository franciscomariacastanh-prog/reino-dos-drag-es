import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  Compass, 
  Sparkles, 
  Rocket, 
  Navigation, 
  X, 
  Zap, 
  Flame, 
  Waves, 
  Trees, 
  Cpu, 
  Snowflake, 
  Skull, 
  Sun 
} from 'lucide-react';
import { DragonElement } from '../types';

export interface TeleportDestination {
  id: string;
  name: string;
  region: 'centro' | 'biomas_centrais' | 'continentes_externos' | 'fronteira';
  biome: DragonElement;
  x: number;
  z: number;
  description: string;
  icon: string;
  color: string;
}

export const TELEPORT_DESTINATIONS: TeleportDestination[] = [
  {
    id: 'dest_sanctuary',
    name: 'Santuário Sagrado Prime (Centro)',
    region: 'centro',
    biome: 'planicie',
    x: 0,
    z: 0,
    description: 'Templo primordial pacífico, praça sagrada e boutique de roupas grátis dos condutores.',
    icon: '🏛️',
    color: '#eab308'
  },
  {
    id: 'dest_volcano_inner',
    name: 'Cordilheira Vulcânica de Magma',
    region: 'biomas_centrais',
    biome: 'magma',
    x: 0,
    z: -540,
    description: 'Caldeira de lava ativa, guardião do vulcão e ninho titã com ovo de magma primordial.',
    icon: '🌋',
    color: '#f97316'
  },
  {
    id: 'dest_volcano_outer',
    name: 'Super-Vulcão do Magma Cósmico',
    region: 'continentes_externos',
    biome: 'magma',
    x: -1200,
    z: -4500,
    description: 'Maciço colossal de fogo e basalto cósmico com 4,5 km de distância do centro.',
    icon: '🔥',
    color: '#ef4444'
  },
  {
    id: 'dest_cyber_inner',
    name: 'Cidadela Apex Robótica',
    region: 'biomas_centrais',
    biome: 'robotico',
    x: 580,
    z: 130,
    description: 'Metrópole de titânio piramidal, sentinela cibernética e os melhores ninhos com tecnologia apex.',
    icon: '⚡',
    color: '#06b6d4'
  },
  {
    id: 'dest_cyber_outer',
    name: 'Megacidade Apex Quântica',
    region: 'continentes_externos',
    biome: 'robotico',
    x: 5200,
    z: 2200,
    description: 'Complexo monumental tecno-místico orbital dos Titãs Cibernéticos a 5,6 km.',
    icon: '🤖',
    color: '#22d3ee'
  },
  {
    id: 'dest_aquatic_inner',
    name: 'Lagoa dos Picos Abissais',
    region: 'biomas_centrais',
    biome: 'aquatico',
    x: 430,
    z: -430,
    description: 'Águas cristalinas marinhas, rotunda submersa ancestral e corais celestes bioluminescentes.',
    icon: '🌊',
    color: '#3b82f6'
  },
  {
    id: 'dest_aquatic_outer',
    name: 'Fossa Oceânica Abissal dos Titãs',
    region: 'continentes_externos',
    biome: 'aquatico',
    x: 4800,
    z: -4800,
    description: 'Grande depressão marítima colossal com recifes de coral abissais a 6,8 km.',
    icon: '🐋',
    color: '#0284c7'
  },
  {
    id: 'dest_forest_inner',
    name: 'Serra Ancestral das Florestas',
    region: 'biomas_centrais',
    biome: 'floresta',
    x: -540,
    z: -200,
    description: 'Bosques druídicos seculares, monólitos cobertos de musgo e ninhos da árvore-mãe.',
    icon: '🌲',
    color: '#10b981'
  },
  {
    id: 'dest_forest_outer',
    name: 'Megabosque das Árvores-Mundo',
    region: 'continentes_externos',
    biome: 'floresta',
    x: -5400,
    z: -3200,
    description: 'Floresta colossal com copas atingindo centenas de metros e seiva cósmica a 6,3 km.',
    icon: '🌿',
    color: '#16a34a'
  },
  {
    id: 'dest_ice_inner',
    name: 'Picos Glaciais de Permafrost',
    region: 'biomas_centrais',
    biome: 'neve',
    x: 40,
    z: 505,
    description: 'Terraço glacial ao ar livre com o Ninho Titã de Permafrost e vista majestosa dos picos de gelo.',
    icon: '❄️',
    color: '#93c5fd'
  },
  {
    id: 'dest_snow_secret_passage',
    name: '🌀 Passagem Secreta na Montanha de Neve',
    region: 'biomas_centrais',
    biome: 'neve',
    x: -30,
    z: 665,
    description: 'Portal arcano oculto esculpido na montanha glacial que teletransporta para a Ilha Secreta (Vila Ancestral, Bioma Negro e Bioma Elétrico).',
    icon: '🌀',
    color: '#38bdf8'
  },
  {
    id: 'dest_secret_island',
    name: '✨ Ilha Secreta (Vila Ancestral & Bioma Negro)',
    region: 'fronteira',
    biome: 'ancestral',
    x: 2600,
    z: 2600,
    description: 'Ilha mística secreta acessível pela passagem da montanha de neve! Contém a Vila Ancestral e o Bioma Negro.',
    icon: '👑',
    color: '#fbbf24'
  },
  {
    id: 'dest_secret_electric',
    name: '⚡ Bioma Elétrico da Tempestade (Ilha Secreta)',
    region: 'fronteira',
    biome: 'eletrico',
    x: 2600,
    z: 2725,
    description: 'Setor de relâmpagos perpétuos e geradores cósmicos na Ilha Secreta com o Ninho do Ovo Titã Voltaico.',
    icon: '⚡',
    color: '#00f0ff'
  },
  {
    id: 'dest_ice_outer',
    name: 'Cordilheira Hiperbórea do Fim do Mundo',
    region: 'continentes_externos',
    biome: 'neve',
    x: 800,
    z: 5500,
    description: 'Cumes titânicos nevados cortando o horizonte com precipícios eternos a 5,6 km.',
    icon: '🏔️',
    color: '#e0f2fe'
  },
  {
    id: 'dest_plains_inner',
    name: 'Maciço Dourado das Planícies',
    region: 'biomas_centrais',
    biome: 'planicie',
    x: 440,
    z: 530,
    description: 'Platôs ensolarados de grama dourada e o grande Coliseu Imperial dos Dragões.',
    icon: '🌾',
    color: '#facc15'
  },
  {
    id: 'dest_plains_outer',
    name: 'Estepes Douradas Infinitas dos Titãs',
    region: 'continentes_externos',
    biome: 'planicie',
    x: 4600,
    z: 4800,
    description: 'Campos sem fim banhados por energia solar dracônica a 6,6 km de distância.',
    icon: '☀️',
    color: '#ca8a04'
  },
  {
    id: 'dest_swamp_inner',
    name: 'Agulhas do Pântano Sombrio',
    region: 'biomas_centrais',
    biome: 'pantano',
    x: -490,
    z: 440,
    description: 'Brejo tóxico coberto por brumas místicas, cogumelos gigantes e sepulcros ancestrais.',
    icon: '☣️',
    color: '#84cc16'
  },
  {
    id: 'dest_swamp_outer',
    name: 'Pântano Quântico Radioativo',
    region: 'continentes_externos',
    biome: 'pantano',
    x: -4800,
    z: 4500,
    description: 'Região enigmática repleta de esporos bioluminescentes e neblina cósmica a 6,6 km.',
    icon: '🧪',
    color: '#a855f7'
  },
  {
    id: 'dest_barrier_frontier',
    name: 'Fronteira Cósmica da Barreira Titânica',
    region: 'fronteira',
    biome: 'planicie',
    x: 0,
    z: 45000,
    description: 'O limiar supremo do continente cósmico (+999999999999999999%) a 45 quilômetros.',
    icon: '🌌',
    color: '#38bdf8'
  }
];

interface TeleportMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentX: number;
  currentZ: number;
  onTeleport: (x: number, z: number, name: string) => void;
}

export const TeleportMapModal: React.FC<TeleportMapModalProps> = ({
  isOpen,
  onClose,
  currentX,
  currentZ,
  onTeleport
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'centro' | 'biomas_centrais' | 'continentes_externos' | 'fronteira'>('todos');

  if (!isOpen) return null;

  const filteredDestinations = TELEPORT_DESTINATIONS.filter(d => {
    if (selectedFilter === 'todos') return true;
    return d.region === selectedFilter;
  });

  const formatDistance = (x: number, z: number) => {
    const dist = Math.hypot(currentX - x, currentZ - z);
    if (dist >= 1000) {
      return `${(dist / 1000).toFixed(1)} km`;
    }
    return `${Math.round(dist)} m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c0d12] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Globe className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-cyan-300">
                  PORTAL DE DOBRA DIMENSIONAL
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold uppercase">
                  +999.999.999.999.999.999%
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono">
                Viaja instantaneamente através das distâncias cósmicas do continente gigantesco (60 km de raio)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 py-3 border-b border-white/5 shrink-0">
          {[
            { id: 'todos', label: 'Todos os Setores (16)' },
            { id: 'centro', label: '🏛️ Santuário Prime' },
            { id: 'biomas_centrais', label: '🧭 Biomas Centrais' },
            { id: 'continentes_externos', label: '🌌 Continentes Externos' },
            { id: 'fronteira', label: '🛡️ Fronteira da Barreira' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                selectedFilter === tab.id
                  ? 'bg-cyan-600/30 border border-cyan-400 text-cyan-200 shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Current Position Badge */}
        <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl text-xs font-mono my-2 text-white/70">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-orange-400" />
            <span>Tua Posição Atual: <span className="text-white font-bold">X: {Math.round(currentX)}m, Z: {Math.round(currentZ)}m</span></span>
          </div>
          <div className="text-[11px] text-cyan-400 font-bold flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5" />
            <span>Raio Total do Continente: 60.000m (120 km de extensão)</span>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="overflow-y-auto pr-1 space-y-2.5 flex-1 min-h-[300px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDestinations.map(dest => {
              const distanceStr = formatDistance(dest.x, dest.z);
              return (
                <div
                  key={dest.id}
                  className="bg-[#12141c] hover:bg-[#161924] border border-white/10 hover:border-cyan-500/40 rounded-xl p-4 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{dest.icon}</span>
                        <div>
                          <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                            {dest.name}
                          </h3>
                          <span className="text-[10px] text-white/40 font-mono">
                            Coords: [{dest.x}, {dest.z}]
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 shrink-0">
                        {distanceStr}
                      </span>
                    </div>

                    <p className="text-xs text-white/60 mb-3 line-clamp-2">
                      {dest.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onTeleport(dest.x, dest.z, dest.name);
                      onClose();
                    }}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Teletransportar Agora</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Tip */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/40 shrink-0">
          <span>Dica: Pressione <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">M</kbd> no teclado para abrir/fechar este mapa de teletransporte a qualquer momento.</span>
          <span className="text-emerald-400 font-bold">Todos os Ninhos contêm Ovos Titãs Supremos!</span>
        </div>
      </div>
    </div>
  );
};
