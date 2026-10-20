import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Dragon, WildGuardian, Biome, BattleLog, DragonSkill, DragonElement } from '../types';
import { DragonAvatar } from './DragonAvatar';
import { soundFx } from '../utils/audio';
import { Swords, Shield, Heart, Zap, Sparkles, AlertCircle, ArrowLeft, Trophy } from 'lucide-react';

interface BattleArenaProps {
  playerDragon: Dragon;
  guardian: WildGuardian;
  biome: Biome;
  onBattleEnd: (won: boolean, rewardXp: number) => void;
  onExit: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  playerDragon,
  guardian,
  biome,
  onBattleEnd,
  onExit
}) => {
  const [playerHp, setPlayerHp] = useState<number>(playerDragon.hp);
  const [guardianHp, setGuardianHp] = useState<number>(guardian.currentHp);
  const [skills, setSkills] = useState<DragonSkill[]>(
    playerDragon.skills.map(s => ({ ...s, currentCooldown: 0 }))
  );
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [logs, setLogs] = useState<BattleLog[]>([
    {
      id: 'log_start',
      text: `⚔️ O combate começou! ${playerDragon.name} ruge ferozmente contra ${guardian.name} no ${biome.name}!`,
      type: 'system',
      timestamp: Date.now()
    }
  ]);
  const [battleState, setBattleState] = useState<'ongoing' | 'victory' | 'defeat'>('ongoing');
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  // Element multiplier calculation
  const getElementalMultiplier = (attacker: DragonElement, defender: DragonElement): number => {
    if (attacker === 'magma' && (defender === 'neve' || defender === 'floresta')) return 1.5;
    if (attacker === 'aquatico' && (defender === 'magma' || defender === 'planicie')) return 1.5;
    if (attacker === 'neve' && (defender === 'floresta' || defender === 'planicie')) return 1.5;
    if (attacker === 'floresta' && (defender === 'pantano' || defender === 'aquatico')) return 1.5;
    if (attacker === 'pantano' && (defender === 'aquatico' || defender === 'planicie')) return 1.5;
    if (attacker === 'robotico') return 1.35; // Nossos dragões robóticos são os mais tecnológicos!
    return 1.0;
  };

  const addLog = (text: string, type: BattleLog['type']) => {
    setLogs(prev => [
      { id: `log_${Date.now()}_${Math.random()}`, text, type, timestamp: Date.now() },
      ...prev.slice(0, 7)
    ]);
  };

  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 500);
  };

  const handlePlayerAction = (skill: DragonSkill) => {
    if (turn !== 'player' || battleState !== 'ongoing' || skill.currentCooldown > 0) return;

    // Sound effect
    if (skill.element === 'robotico') {
      soundFx.playLaser();
    } else if (skill.element === 'magma') {
      soundFx.playFire();
    } else {
      soundFx.playRoar(skill.element);
    }

    if (skill.type === 'ultimate') {
      triggerScreenShake();
    }

    // Calculate damage
    const elementMult = getElementalMultiplier(skill.element, guardian.element);
    const baseDamage = Math.round((playerDragon.atk * (skill.power / 100)) - (guardian.def * 0.25));
    const finalDamage = Math.max(120, Math.round(baseDamage * elementMult));

    let newGuardianHp = guardianHp;

    if (skill.type === 'defense') {
      // Shield or Heal
      const healAmount = Math.round(playerDragon.maxHp * 0.2);
      const newHp = Math.min(playerDragon.maxHp, playerHp + healAmount);
      setPlayerHp(newHp);
      addLog(`🛡️ ${playerDragon.name} utilizou [${skill.name}], regenerando +${healAmount} de HP!`, 'heal');
    } else {
      // Attack or Ultimate
      newGuardianHp = Math.max(0, guardianHp - finalDamage);
      setGuardianHp(newGuardianHp);

      const advantageNote = elementMult > 1 ? ' (🔥 Super Efetivo!)' : '';
      const ultNote = skill.type === 'ultimate' ? ' ★ GOLPE SUPREMO TITÂNICO ★' : '';
      addLog(
        `💥 ${playerDragon.name} usou [${skill.name}]${ultNote} causando ${finalDamage} de dano${advantageNote}!`,
        elementMult > 1 || skill.type === 'ultimate' ? 'crit' : 'player'
      );
    }

    // Set cooldowns
    setSkills(prev =>
      prev.map(s => {
        if (s.id === skill.id) return { ...s, currentCooldown: s.cooldown };
        return { ...s, currentCooldown: Math.max(0, s.currentCooldown - 1) };
      })
    );

    // Check Victory
    if (newGuardianHp <= 0) {
      setBattleState('victory');
      soundFx.playVictory();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      addLog(`🏆 ${guardian.name} foi derrotado! Você conquistou ${guardian.rewardXp} XP!`, 'crit');
      return;
    }

    // Enemy Turn
    setTurn('enemy');
    setTimeout(() => {
      handleEnemyTurn();
    }, 1100);
  };

  const handleEnemyTurn = () => {
    if (battleState !== 'ongoing') return;

    // Pick enemy skill
    const enemySkill = guardian.skills[Math.floor(Math.random() * guardian.skills.length)];
    const enemyDamage = Math.max(
      90,
      Math.round((guardian.atk * (enemySkill.power / 100)) - (playerDragon.def * 0.35))
    );

    const newPlayerHp = Math.max(0, playerHp - enemyDamage);
    setPlayerHp(newPlayerHp);
    soundFx.playRoar(guardian.element);

    addLog(
      `⚠️ ${guardian.name} revidou com [${enemySkill.name}], desferindo ${enemyDamage} de dano!`,
      'enemy'
    );

    if (newPlayerHp <= 0) {
      setBattleState('defeat');
      addLog(`💀 ${playerDragon.name} recuou para recuperar suas forças.`, 'system');
    } else {
      setTurn('player');
    }
  };

  return (
    <div
      className={`relative min-h-[680px] bg-[radial-gradient(circle_at_center,_#1a1a20_0%,_#0a0a0c_100%)] border border-white/10 rounded-2xl p-4 sm:p-8 shadow-2xl overflow-hidden ${
        isScreenShaking ? 'translate-x-1 translate-y-1 transition-transform' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <button
          onClick={onExit}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Recuar da Batalha
        </button>
        <div className="text-center">
          <span className="text-[10px] font-mono uppercase text-orange-400 font-bold tracking-wider">
            Arena Territorial do {biome.name}
          </span>
          <h3 className="text-lg font-light text-white">
            Confronto de <span className="font-serif italic text-orange-400 font-normal">Titãs Elementais</span>
          </h3>
        </div>
        <div className="text-xs text-white/40 font-mono">
          Turno: <strong className="text-white uppercase">{turn === 'player' ? 'Seu Ataque' : 'Inimigo...'}</strong>
        </div>
      </div>

      {/* Combatants Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-6">
        {/* Left Side: Player's Dragon */}
        <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-light text-lg text-white font-serif italic">{playerDragon.name}</h4>
                {playerDragon.isTitanPermanent && (
                  <span className="bg-red-600/80 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                    Titã Permanente
                  </span>
                )}
              </div>
              <div className="text-[11px] text-orange-400 capitalize font-mono mt-0.5">
                Elemento: {playerDragon.element} • Nível {playerDragon.level}
              </div>
            </div>
          </div>

          {/* HP Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-mono text-white/60 mb-1">
              <span className="flex items-center gap-1 font-bold">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Vida (HP)
              </span>
              <span>
                {playerHp} / {playerDragon.maxHp}
              </span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
                style={{ width: `${(playerHp / playerDragon.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center my-2">
            <DragonAvatar dragon={playerDragon} size="lg" />
          </div>
        </div>

        {/* Right Side: Wild Guardian */}
        <div className="bg-[#0d0d10] border border-red-500/20 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-light text-lg text-white font-serif italic">{guardian.name}</h4>
                <span className="bg-red-950/60 text-red-300 border border-red-500/30 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                  Guardião
                </span>
              </div>
              <div className="text-[11px] text-red-400 capitalize font-mono mt-0.5">
                Elemento: {guardian.element} • Nível {guardian.level}
              </div>
            </div>
          </div>

          {/* Guardian HP Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-mono text-white/60 mb-1">
              <span className="flex items-center gap-1 font-bold">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Vida (HP)
              </span>
              <span>
                {guardianHp} / {guardian.maxHp}
              </span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300"
                style={{ width: `${(guardianHp / guardian.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Guardian Visual Representation */}
          <div className="flex flex-col items-center justify-center h-48 my-2 text-center p-4">
            <div className="w-24 h-24 rounded-full bg-red-950/30 border border-red-500/40 flex items-center justify-center text-red-400 shadow-2xl animate-pulse">
              <Swords className="w-12 h-12" />
            </div>
            <span className="text-xs text-white/40 mt-3 italic max-w-xs line-clamp-2 font-serif">
              "{guardian.description}"
            </span>
          </div>
        </div>
      </div>

      {/* Battle Controls (Player Skills) or Victory Screen */}
      {battleState === 'ongoing' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-white/60 font-bold tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-400" /> Ações Dracônicas:
            </span>
            {turn === 'player' ? (
              <span className="text-xs text-emerald-400 font-mono font-bold animate-pulse">
                Sua Vez de Atacar!
              </span>
            ) : (
              <span className="text-xs text-orange-400 font-mono">O Guardião está agindo...</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {skills.map(skill => {
              const isOnCooldown = skill.currentCooldown > 0;
              const isUltimate = skill.type === 'ultimate';

              return (
                <button
                  key={skill.id}
                  disabled={turn !== 'player' || isOnCooldown}
                  onClick={() => handlePlayerAction(skill)}
                  className={`p-3.5 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                    isOnCooldown
                      ? 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
                      : isUltimate
                      ? 'bg-gradient-to-r from-orange-600 to-red-700 border-orange-400 text-white shadow-lg ring-1 ring-orange-400/50'
                      : 'bg-[#111114] border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-xs sm:text-sm truncate">{skill.name}</span>
                    {isOnCooldown ? (
                      <span className="text-[9px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded font-mono">
                        Recarga: {skill.currentCooldown}
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40 text-white/80 font-bold">
                        Poder: {skill.power}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 line-clamp-2 mt-1">
                    {skill.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : battleState === 'victory' ? (
        <div className="bg-[#0d0d10] border border-emerald-500/40 rounded-2xl p-6 text-center backdrop-blur-md animate-in zoom-in-95">
          <Trophy className="w-10 h-10 text-orange-400 mx-auto mb-2 animate-bounce" />
          <h3 className="text-xl font-light text-white mb-1">
            Vitória <span className="font-serif italic text-emerald-400 font-normal">Épica!</span>
          </h3>
          <p className="text-xs text-white/60 mb-4 font-mono">
            Seu dragão dominou o território e garantiu <strong className="text-emerald-400">+{guardian.rewardXp} XP</strong> para subir de nível!
          </p>
          <button
            onClick={() => onBattleEnd(true, guardian.rewardXp)}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
          >
            Reivindicar Recompensas & Voltar
          </button>
        </div>
      ) : (
        <div className="bg-[#0d0d10] border border-rose-500/30 rounded-2xl p-6 text-center backdrop-blur-md">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <h3 className="text-xl font-light text-white mb-1">
            Recuo <span className="font-serif italic text-rose-400 font-normal">Estratégico</span>
          </h3>
          <p className="text-xs text-white/50 mb-4 font-mono">
            O guardião resistiu ao confronto. Seu dragão descansou e suas energias foram restauradas.
          </p>
          <button
            onClick={() => onBattleEnd(false, 0)}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Voltar ao Santuário
          </button>
        </div>
      )}

      {/* Battle Combat Logs */}
      <div className="mt-6 bg-[#0a0a0c] border border-white/10 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1 text-xs font-mono">
        {logs.map(log => (
          <div
            key={log.id}
            className={`${
              log.type === 'player'
                ? 'text-cyan-300'
                : log.type === 'enemy'
                ? 'text-rose-300'
                : log.type === 'crit'
                ? 'text-orange-400 font-bold'
                : log.type === 'heal'
                ? 'text-emerald-400'
                : 'text-white/40'
            }`}
          >
            {log.text}
          </div>
        ))}
      </div>
    </div>
  );
};
