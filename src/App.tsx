import React, { useState, useEffect } from 'react';
import { 
  Dragon, 
  Egg, 
  IncubatorSlot, 
  Biome, 
  WildGuardian, 
  ArmorSlot, 
  Armor, 
  DragonElement,
  UserProfile,
  RiderCustomizationState,
  DragonSkinStyle
} from './types';
import { STARTER_MAGMA_TITAN } from './data/dragons';
import { ALL_ARMORS } from './data/armors';
import { BIOMES, generateEggFromBiome } from './data/biomes';
import { DragonSanctuary } from './components/DragonSanctuary';
import { BiomeExplorer } from './components/BiomeExplorer';
import { ArmoryView } from './components/ArmoryView';
import { DragonManager } from './components/DragonManager';
import { BattleArena } from './components/BattleArena';
import { IncubatorModal } from './components/IncubatorModal';
import { DragonWorld3D } from './components/DragonWorld3D';
import { CreatorPanelModal } from './components/CreatorPanelModal';
import { useMultiplayer } from './utils/useMultiplayer';
import { DEFAULT_RIDER_CUSTOMIZATION } from './data/riderOutfits';
import { MASTER_CREATOR_EMAIL, MASTER_CREATOR_NAME, getOmniTitanDragon, getLeviathanDragon } from './data/creatorPerks';
import { soundFx } from './utils/audio';
import { 
  Flame, 
  Compass, 
  Shield, 
  Sparkles, 
  Layers, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Wind,
  Crown,
  Globe
} from 'lucide-react';

const STORAGE_KEY = 'dragon_realm_save_v1';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'sanctuary' | 'world3d' | 'biomes' | 'armory' | 'collection' | 'battle'>('sanctuary');

  // Master Creator Profile & Status ("Tudo Grátis Apenas para Mim")
  const [isCreatorMode, setIsCreatorMode] = useState<boolean>(true);
  const [isCreatorPanelOpen, setIsCreatorPanelOpen] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('dragon_user_profile_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.username) {
          parsed.username = parsed.username.replace(/castanha/gi, '').replace(/\s+/g, ' ').trim();
        }
        return parsed;
      }
    } catch {}
    return {
      id: `francisco_${Math.random().toString(36).substring(2, 7)}`,
      username: 'Francisco (Criador Titã)',
      email: MASTER_CREATOR_EMAIL,
      isCreator: true,
      activeTitle: '👑 Mestre Titã Supremo'
    };
  });

  const [riderCustomization] = useState<RiderCustomizationState>(() => {
    try {
      const saved = localStorage.getItem('dragon_rider_customization');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      equippedOutfitId: 'outfit_francisco_creator',
      equippedHelmetId: 'helm_crown',
      equippedCapeId: 'cape_royal',
      currentOptions: { ...DEFAULT_RIDER_CUSTOMIZATION }
    };
  });

  // Dragons Squad (Permanent Magma Titan, Omni-Titan, and Leviathan)
  const [dragons, setDragons] = useState<Dragon[]>(() => {
    const omniTitan = getOmniTitanDragon();
    const leviathan = getLeviathanDragon();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dragons && Array.isArray(parsed.dragons) && parsed.dragons.length > 0) {
          const list: Dragon[] = [...parsed.dragons];
          if (!list.some(d => d.id === omniTitan.id || d.name.toLowerCase().includes('omni-titan'))) {
            list.push(omniTitan);
          }
          if (!list.some(d => d.id === leviathan.id || d.name.toLowerCase().includes('leviathan'))) {
            list.push(leviathan);
          }
          return list;
        }
      }
    } catch (e) {
      console.error('Failed to load saved dragons', e);
    }
    return [STARTER_MAGMA_TITAN, omniTitan, leviathan];
  });

  const [activeDragonId, setActiveDragonId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeDragonId) return parsed.activeDragonId;
      }
    } catch {}
    return STARTER_MAGMA_TITAN.id;
  });

  // Egg Inventory & Incubator Chambers
  const [eggInventory, setEggInventory] = useState<Egg[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.eggInventory) return parsed.eggInventory;
      }
    } catch {}
    return [
      generateEggFromBiome('robotico'),
      generateEggFromBiome('aquatico')
    ];
  });

  const [incubatorSlots, setIncubatorSlots] = useState<IncubatorSlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.incubatorSlots && parsed.incubatorSlots.length >= 6) return parsed.incubatorSlots;
      }
    } catch {}
    return [
      { id: 1, egg: null, isIncubating: false },
      { id: 2, egg: null, isIncubating: false },
      { id: 3, egg: null, isIncubating: false },
      { id: 4, egg: null, isIncubating: false },
      { id: 5, egg: null, isIncubating: false },
      { id: 6, egg: null, isIncubating: false }
    ];
  });

  const activeDragon = dragons.find(d => d.id === activeDragonId) || dragons[0];

  // REAL-TIME MULTIPLAYER WEBSOCKET CONNECTION
  const multiplayer = useMultiplayer({
    userProfile,
    activeDragon,
    riderCustomization,
    room: 'reino-central',
    enabled: true
  });

  // Battle State
  const [activeBattle, setActiveBattle] = useState<{
    guardian: WildGuardian;
    biome: Biome;
  } | null>(null);

  // Modals & Sound
  const [isIncubatorOpen, setIsIncubatorOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-grant Omni-Titan and Leviathan & clean username
  useEffect(() => {
    const omniTitan = getOmniTitanDragon();
    const leviathan = getLeviathanDragon();
    let updated = false;

    setDragons(prev => {
      const list = [...prev];
      if (!list.some(d => d.id === omniTitan.id || d.name.toLowerCase().includes('omni-titan'))) {
        list.push(omniTitan);
        updated = true;
      }
      if (!list.some(d => d.id === leviathan.id || d.name.toLowerCase().includes('leviathan'))) {
        list.push(leviathan);
        updated = true;
      }
      return updated ? list : prev;
    });

    if (updated) {
      showToast('🐉 Leviathan e Omni-Titan foram adicionados ao teu esquadrão!');
    }

    try {
      const savedProfile = localStorage.getItem('dragon_user_profile_v1');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.username && /castanha/i.test(p.username)) {
          p.username = p.username.replace(/castanha/gi, '').replace(/\s+/g, ' ').trim();
          localStorage.setItem('dragon_user_profile_v1', JSON.stringify(p));
          setUserProfile(p);
        }
      }
    } catch {}
  }, []);

  // Auto-save game progress to localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        dragons,
        activeDragonId,
        eggInventory,
        incubatorSlots
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save game state', e);
    }
  }, [dragons, activeDragonId, eggInventory, incubatorSlots]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ================= ACTION HANDLERS =================

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  // Creator Exclusive Action Handlers ("Tudo Grátis Apenas para Mim")
  const handleAddCreatorDragons = (newDragons: Dragon[]) => {
    setDragons(prev => {
      const existingIds = new Set(prev.map(d => d.id));
      const filtered = newDragons.filter(d => !existingIds.has(d.id));
      return [...filtered, ...prev];
    });
    if (newDragons.length > 0) {
      setActiveDragonId(newDragons[0].id);
      multiplayer.broadcastDragonChange(newDragons[0]);
    }
    showToast(`👑 ${newDragons.length} Dragões Deuses Titãs desbloqueados gratuitamente para ti!`);
  };

  const handleAddCreatorEggs = (newEggs: Egg[]) => {
    setEggInventory(prev => [...newEggs, ...prev]);
    showToast(`🥚 ${newEggs.length} Ovos Titânicos Instantâneos adicionados gratuitamente!`);
  };

  const handleBuffActiveDragon = () => {
    setDragons(prev => prev.map(d => {
      if (d.id === activeDragonId) {
        return {
          ...d,
          level: 100,
          maxLevel: 100,
          hp: 99999,
          maxHp: 99999,
          atk: 9999,
          def: 9999,
          spd: 600,
          title: '👑 Titã Supremo Cósmico do Criador'
        };
      }
      return d;
    }));
    showToast(`⚡ Poder Supremo ativado no ${activeDragon.name}! +99,999 HP, +9,999 ATK!`);
  };

  const handleMaxCurrencies = () => {
    showToast(`💎 Moedas & Essências Infinitas ativadas exclusivamente para Francisco!`);
  };

  const handleToggleCreatorMode = () => {
    setIsCreatorMode(prev => {
      const next = !prev;
      setUserProfile(p => ({
        ...p,
        isCreator: next,
        username: next ? 'Francisco (Criador Titã)' : 'Cavaleiro Visitante'
      }));
      showToast(next 
        ? '👑 Modo Criador Titã Ativado! Tudo 100% grátis para Francisco.' 
        : '🔒 Modo Visitante Ativado (Testando restrições normais).'
      );
      return next;
    });
  };

  // Collect egg from a biome nest
  const handleCollectEgg = (egg: Egg) => {
    setEggInventory(prev => [egg, ...prev]);
    showToast(`🥚 ${egg.name} coletado com sucesso! Disponível na Incubadora da Base.`);
  };

  // Place egg into an incubator slot
  const handlePlaceEggInIncubator = (slotId: number, egg: Egg) => {
    // Remove egg from inventory
    setEggInventory(prev => prev.filter(e => e.id !== egg.id));

    // For Francisco / Creator mode, eggs hatch in 0s!
    const hatchTime = isCreatorMode ? 0 : egg.hatchDurationSeconds;

    // Place into incubator slot
    setIncubatorSlots(prev =>
      prev.map(slot => {
        if (slot.id === slotId) {
          return {
            ...slot,
            egg: { ...egg, timeRemaining: hatchTime },
            isIncubating: true,
            startedAt: Date.now()
          };
        }
        return slot;
      })
    );
    showToast(`🔥 ${egg.name} inserido na Câmara #${slotId}! ${isCreatorMode ? '(Choco Instantâneo 0s Ativo)' : ''}`);
  };

  // Accelerate egg hatching
  const handleAccelerateEgg = (slotId: number, seconds: number) => {
    setIncubatorSlots(prev =>
      prev.map(slot => {
        if (slot.id === slotId && slot.egg) {
          const newTime = Math.max(0, slot.egg.timeRemaining - seconds);
          return {
            ...slot,
            egg: { ...slot.egg, timeRemaining: newTime }
          };
        }
        return slot;
      })
    );
  };

  // Egg hatched into a new Dragon
  const handleEggHatched = (slotId: number, newDragon: Dragon) => {
    // Free the incubator slot
    setIncubatorSlots(prev =>
      prev.map(slot => {
        if (slot.id === slotId) {
          return { ...slot, egg: null, isIncubating: false, startedAt: undefined };
        }
        return slot;
      })
    );

    // Add new dragon to squad
    setDragons(prev => [...prev, newDragon]);
    showToast(`🎉 Parabéns! ${newDragon.name} juntou-se ao seu Santuário!`);
  };

  // Equip / Unequip Free Armor
  const handleUpdateDragonArmor = (dragonId: string, slot: ArmorSlot, armor: Armor | undefined) => {
    setDragons(prev =>
      prev.map(d => {
        if (d.id === dragonId) {
          const newEquipped = { ...d.equippedArmor };
          if (armor) {
            newEquipped[slot] = armor;
          } else {
            delete newEquipped[slot];
          }
          return { ...d, equippedArmor: newEquipped };
        }
        return d;
      })
    );
  };

  // Equip Full Matching Set
  const handleEquipFullSet = (dragonId: string, element: DragonElement) => {
    const matchingPieces = ALL_ARMORS.filter(a => a.element === element);
    const newEquipped: Partial<Record<ArmorSlot, Armor>> = {};

    matchingPieces.forEach(piece => {
      newEquipped[piece.slot] = piece;
    });

    setDragons(prev =>
      prev.map(d => {
        if (d.id === dragonId) {
          return { ...d, equippedArmor: newEquipped };
        }
        return d;
      })
    );
    showToast(`🛡️ Conjunto elemental completo de ${element.toUpperCase()} equipado com sucesso!`);
  };

  // Train / Level up dragon
  const handleLevelUpDragon = (dragonId: string) => {
    setDragons(prev =>
      prev.map(d => {
        if (d.id === dragonId && d.level < d.maxLevel) {
          const newLevel = d.level + 1;
          const statBoost = 1.04; // +4% stats per level
          return {
            ...d,
            level: newLevel,
            hp: Math.round(d.hp * statBoost),
            maxHp: Math.round(d.maxHp * statBoost),
            atk: Math.round(d.atk * statBoost),
            def: Math.round(d.def * statBoost),
            spd: Math.round(d.spd * statBoost)
          };
        }
        return d;
      })
    );
    showToast(`⚡ Dragão evoluiu para o Nível seguinte! Atributos aumentados!`);
  };

  // Start Battle against a wild guardian
  const handleStartBattle = (guardian: WildGuardian, biome: Biome) => {
    setActiveBattle({ guardian, biome });
    setCurrentView('battle');
  };

  // End Battle
  const handleBattleEnd = (won: boolean, rewardXp: number) => {
    if (won && rewardXp > 0) {
      // Award XP to active dragon
      setDragons(prev =>
        prev.map(d => {
          if (d.id === activeDragonId) {
            const newXp = d.xp + rewardXp;
            if (newXp >= d.xpToNext && d.level < d.maxLevel) {
              const newLevel = d.level + 1;
              return {
                ...d,
                level: newLevel,
                xp: newXp - d.xpToNext,
                xpToNext: Math.round(d.xpToNext * 1.2),
                hp: Math.round(d.hp * 1.05),
                maxHp: Math.round(d.maxHp * 1.05),
                atk: Math.round(d.atk * 1.05),
                def: Math.round(d.def * 1.05)
              };
            }
            return { ...d, xp: newXp };
          }
          return d;
        })
      );
    }
    setActiveBattle(null);
    setCurrentView('biomes');
  };

  // Reset progress (for testing)
  const handleResetGame = () => {
    if (window.confirm('Deseja reiniciar a jornada com o Titã de Magma inicial?')) {
      localStorage.removeItem(STORAGE_KEY);
      setDragons([STARTER_MAGMA_TITAN]);
      setActiveDragonId(STARTER_MAGMA_TITAN.id);
      setEggInventory([
        generateEggFromBiome('robotico'),
        generateEggFromBiome('aquatico')
      ]);
      setIncubatorSlots([
        { id: 1, egg: null, isIncubating: false },
        { id: 2, egg: null, isIncubating: false },
        { id: 3, egg: null, isIncubating: false }
      ]);
      setCurrentView('sanctuary');
      showToast('Jogo restaurado com o Titã de Magma permanente!');
    }
  };

  // Award XP to active dragon (from 3D world crystals, breakable targets, nests)
  const handleAwardXp = (amount: number) => {
    setDragons(prev => prev.map(d => {
      if (d.id === activeDragonId) {
        const newXp = d.xp + amount;
        const xpThreshold = d.level * 100;
        if (newXp >= xpThreshold) {
          const nextLevel = d.level + 1;
          const statBoost = Math.round(d.level * 8);
          showToast(`✨ ${d.name} subiu para o Nível ${nextLevel}!`);
          return {
            ...d,
            level: nextLevel,
            xp: newXp - xpThreshold,
            maxHp: d.maxHp + statBoost * 2,
            hp: d.maxHp + statBoost * 2,
            atk: d.atk + statBoost,
            def: d.def + Math.round(statBoost * 0.7),
            speed: d.speed + Math.round(statBoost * 0.5)
          };
        }
        return { ...d, xp: newXp };
      }
      return d;
    }));
  };

  // Update dragon realistic skin
  const handleUpdateDragonSkin = (
    dragonId: string,
    skinStyle: DragonSkinStyle,
    customColors?: { primary: string; secondary: string; emissive: string }
  ) => {
    setDragons(prev => prev.map(d => {
      if (d.id === dragonId) {
        const updatedVisual = {
          ...d.visual,
          skinStyle,
          ...(customColors ? {
            primaryColor: customColors.primary,
            secondaryColor: customColors.secondary,
            glowColor: customColors.emissive
          } : {})
        };
        const updated = {
          ...d,
          visual: updatedVisual
        };
        if (d.id === activeDragonId) {
          multiplayer.broadcastDragonChange(updated);
        }
        return updated;
      }
      return d;
    }));
    showToast('✨ Nova skin realista equipada com sucesso ao dragão!');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e0e0e0] flex flex-col selection:bg-orange-600 selection:text-white font-sans">
      {/* Top Header - Sophisticated Dark Bar */}
      <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-[#111114]/95 backdrop-blur-md px-4 sm:px-8">
        <div className="max-w-7xl h-full mx-auto flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div
            onClick={() => {
              setCurrentView('sanctuary');
              soundFx.playClick();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-900 rounded-lg flex items-center justify-center border border-white/20 shadow-lg shadow-orange-900/40 group-hover:scale-105 transition-transform shrink-0">
              <Flame className="w-5 h-5 text-orange-200" />
            </div>
            <div>
              <div className="text-base sm:text-lg tracking-widest font-light uppercase text-white font-sans flex items-center gap-1.5 leading-tight">
                Reino dos <span className="font-bold text-orange-500">Dragões</span>
                <span className="text-[9px] bg-orange-600/20 text-orange-400 border border-orange-500/40 font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Titã
                </span>
              </div>
              <div className="text-[10px] text-white/40 tracking-wider uppercase font-mono">
                Magma Primordial & 6 Biomas
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0d0d10] border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => {
                setCurrentView('sanctuary');
                soundFx.playClick();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                currentView === 'sanctuary'
                  ? 'bg-white/10 text-orange-400 border border-orange-500/40 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" /> Santuário Base
            </button>

            <button
              onClick={() => {
                setCurrentView('world3d');
                soundFx.playClick();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                currentView === 'world3d'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-sm'
                  : 'text-orange-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-orange-400" /> Mundo 3D
            </button>

            <button
              onClick={() => {
                setCurrentView('biomes');
                soundFx.playClick();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                currentView === 'biomes'
                  ? 'bg-white/10 text-orange-400 border border-orange-500/40 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> 6 Biomas & Ninhos
            </button>

            <button
              onClick={() => {
                setIsIncubatorOpen(true);
                soundFx.playClick();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 border border-transparent hover:border-cyan-500/30 relative"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Incubadora
              {incubatorSlots.some(s => s.egg && s.egg.timeRemaining <= 0) && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-ping" />
              )}
            </button>

            <button
              onClick={() => {
                setCurrentView('armory');
                soundFx.playClick();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                currentView === 'armory'
                  ? 'bg-white/10 text-orange-400 border border-orange-500/40 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Armaduras Grátis
            </button>

            <button
              onClick={() => {
                setCurrentView('collection');
                soundFx.playClick();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                currentView === 'collection'
                  ? 'bg-white/10 text-orange-400 border border-orange-500/40 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Esquadrão ({dragons.length})
            </button>
          </nav>

          {/* Quick Header Counters & Controls */}
          <div className="flex items-center gap-3">
            {/* Draconic Essence readout */}
            <div className="hidden lg:flex items-center gap-2 border-r border-white/10 pr-3">
              <div className="text-right">
                <div className="text-[10px] uppercase text-white/40 tracking-tighter">Essência Dracônica</div>
                <div className="text-orange-400 font-mono text-xs font-bold">
                  {isCreatorMode ? '∞ XP' : (dragons.reduce((acc, d) => acc + d.xp + (d.level * 250), 4500)).toLocaleString() + ' XP'}
                </div>
              </div>
              <div className="text-right pl-3">
                <div className="text-[10px] uppercase text-white/40 tracking-tighter">Sucata Robótica</div>
                <div className="text-cyan-400 font-mono text-xs font-bold">
                  {isCreatorMode ? '∞ SC' : (eggInventory.filter(e => e.element === 'robotico').length * 450 + 1204).toLocaleString() + ' SC'}
                </div>
              </div>
            </div>

            {/* Multiplayer Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{multiplayer.remotePlayers.size + 1} Online</span>
            </div>

            {/* Creator Panel Button */}
            <button
              onClick={() => setIsCreatorPanelOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all border border-amber-300/40 active:scale-95"
              title="Abrir Painel do Criador Titã (Tudo Grátis Apenas para Mim)"
            >
              <Crown className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Criador (Tudo Grátis)</span>
              <span className="sm:hidden">Criador</span>
            </button>

            <button
              onClick={() => setIsIncubatorOpen(true)}
              className="md:hidden p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>Incubar</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors"
              title={isMuted ? 'Desmutar' : 'Mutar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
            </button>

            <button
              onClick={handleResetGame}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 transition-colors"
              title="Reiniciar Jogo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#111114] border border-orange-500/60 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 text-xs sm:text-sm font-sans">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#111114]/95 backdrop-blur-md border-t border-white/10 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            setCurrentView('sanctuary');
            soundFx.playClick();
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium tracking-wider ${
            currentView === 'sanctuary' ? 'text-orange-400' : 'text-white/40'
          }`}
        >
          <Flame className="w-5 h-5" /> Base
        </button>

        <button
          onClick={() => {
            setCurrentView('world3d');
            soundFx.playClick();
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium tracking-wider ${
            currentView === 'world3d' ? 'text-orange-400 font-bold' : 'text-white/40'
          }`}
        >
          <Wind className="w-5 h-5" /> 3D
        </button>

        <button
          onClick={() => {
            setCurrentView('biomes');
            soundFx.playClick();
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium tracking-wider ${
            currentView === 'biomes' ? 'text-orange-400' : 'text-white/40'
          }`}
        >
          <Compass className="w-5 h-5" /> Biomas
        </button>

        <button
          onClick={() => {
            setCurrentView('armory');
            soundFx.playClick();
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium tracking-wider ${
            currentView === 'armory' ? 'text-orange-400' : 'text-white/40'
          }`}
        >
          <Shield className="w-5 h-5" /> Armaduras
        </button>

        <button
          onClick={() => {
            setCurrentView('collection');
            soundFx.playClick();
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium tracking-wider ${
            currentView === 'collection' ? 'text-orange-400' : 'text-white/40'
          }`}
        >
          <Layers className="w-5 h-5" /> Esquadrão
        </button>
      </div>

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 mb-16 md:mb-6">
        {currentView === 'sanctuary' && (
          <DragonSanctuary
            dragons={dragons}
            activeDragonId={activeDragonId}
            eggInventory={eggInventory}
            incubatorSlots={incubatorSlots}
            onSelectActiveDragon={setActiveDragonId}
            onOpenBiomeMap={() => setCurrentView('biomes')}
            onOpenArmory={() => setCurrentView('armory')}
            onOpenIncubator={() => setIsIncubatorOpen(true)}
            onOpenDragonCollection={() => setCurrentView('collection')}
            onOpen3DWorld={() => setCurrentView('world3d')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            isCreatorMode={isCreatorMode}
            onOpenCreatorPanel={() => setIsCreatorPanelOpen(true)}
            onlinePlayersCount={multiplayer.remotePlayers.size + 1}
            onUpdateDragonSkin={handleUpdateDragonSkin}
          />
        )}

        {currentView === 'world3d' && (
          <DragonWorld3D
            activeDragon={activeDragon}
            allDragons={dragons}
            onSelectActiveDragon={(id) => {
              setActiveDragonId(id);
              const d = dragons.find(item => item.id === id);
              if (d) multiplayer.broadcastDragonChange(d);
            }}
            onCollectEgg={handleCollectEgg}
            onAwardXp={handleAwardXp}
            onStartBattle={handleStartBattle}
            onReturnToBase={() => setCurrentView('sanctuary')}
            onOpenIncubator={() => setIsIncubatorOpen(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            userProfile={userProfile}
            isCreatorMode={isCreatorMode}
            onOpenCreatorPanel={() => setIsCreatorPanelOpen(true)}
            multiplayer={multiplayer}
            onUpdateDragonSkin={handleUpdateDragonSkin}
          />
        )}

        {currentView === 'biomes' && (
          <BiomeExplorer
            activeDragon={activeDragon}
            onCollectEgg={handleCollectEgg}
            onStartBattle={handleStartBattle}
            onReturnToBase={() => setCurrentView('sanctuary')}
          />
        )}

        {currentView === 'armory' && (
          <ArmoryView
            dragons={dragons}
            activeDragonId={activeDragonId}
            onUpdateDragonArmor={handleUpdateDragonArmor}
            onEquipFullSet={handleEquipFullSet}
          />
        )}

        {currentView === 'collection' && (
          <DragonManager
            dragons={dragons}
            activeDragonId={activeDragonId}
            onSelectActiveDragon={setActiveDragonId}
            onLevelUpDragon={handleLevelUpDragon}
            onOpenArmory={() => setCurrentView('armory')}
            onClose={() => setCurrentView('sanctuary')}
            onUpdateDragonSkin={handleUpdateDragonSkin}
            isCreatorMode={isCreatorMode}
          />
        )}

        {currentView === 'battle' && activeBattle && (
          <BattleArena
            playerDragon={activeDragon}
            guardian={activeBattle.guardian}
            biome={activeBattle.biome}
            onBattleEnd={handleBattleEnd}
            onExit={() => {
              setActiveBattle(null);
              setCurrentView('biomes');
            }}
          />
        )}
      </main>

      {/* Incubator Modal */}
      {isIncubatorOpen && (
        <IncubatorModal
          slots={incubatorSlots}
          eggInventory={eggInventory}
          onPlaceEgg={handlePlaceEggInIncubator}
          onEggHatched={handleEggHatched}
          onAccelerateEgg={handleAccelerateEgg}
          onClose={() => setIsIncubatorOpen(false)}
          isCreatorMode={isCreatorMode}
          onAddEggs={handleAddCreatorEggs}
        />
      )}

      {/* Creator Perks Panel Modal ("Tudo Grátis Apenas para Mim") */}
      <CreatorPanelModal
        isOpen={isCreatorPanelOpen}
        onClose={() => setIsCreatorPanelOpen(false)}
        isCreatorMode={isCreatorMode}
        onToggleCreatorMode={handleToggleCreatorMode}
        onAddDragons={handleAddCreatorDragons}
        onAddEggs={handleAddCreatorEggs}
        onBuffActiveDragon={handleBuffActiveDragon}
        onMaxCurrencies={handleMaxCurrencies}
        activeDragon={activeDragon}
        onlinePlayersCount={multiplayer.remotePlayers.size + 1}
        currentRoom={multiplayer.currentRoom}
        onChangeRoom={multiplayer.setCurrentRoom}
      />
    </div>
  );
}
