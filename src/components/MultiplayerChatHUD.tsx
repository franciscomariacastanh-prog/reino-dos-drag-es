import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Crown, 
  Sparkles, 
  Flame, 
  Wind, 
  Compass, 
  X,
  Volume2
} from 'lucide-react';
import { MultiplayerChatMessage, RemotePlayer } from '../types';

interface MultiplayerChatHUDProps {
  chatMessages: MultiplayerChatMessage[];
  remotePlayers: Map<string, RemotePlayer>;
  onSendChat: (message: string) => void;
  onSendAction?: (actionType: string, payload?: any) => void;
  playerCoords: { x: number; z: number };
  currentRoom: string;
  isCreator: boolean;
  myUsername: string;
  onTeleportNearPlayer?: (pos: [number, number, number]) => void;
}

export const MultiplayerChatHUD: React.FC<MultiplayerChatHUDProps> = ({
  chatMessages,
  remotePlayers,
  onSendChat,
  onSendAction,
  playerCoords,
  currentRoom,
  isCreator,
  myUsername,
  onTeleportNearPlayer
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showPlayersList, setShowPlayersList] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMsgCountRef = useRef<number>(chatMessages.length);

  useEffect(() => {
    if (!isOpen && chatMessages.length > lastMsgCountRef.current) {
      setUnreadCount(prev => prev + (chatMessages.length - lastMsgCountRef.current));
    }
    lastMsgCountRef.current = chatMessages.length;
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    setUnreadCount(0);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendChat(inputText);
    setInputText('');
  };

  const handleQuickEmote = (text: string, action?: string) => {
    onSendChat(text);
    if (action && onSendAction) {
      onSendAction(action);
    }
  };

  const onlineList: RemotePlayer[] = Array.from(remotePlayers.values());

  return (
    <div className="fixed bottom-5 left-4 z-40 flex flex-col font-sans select-none pointer-events-auto">
      {/* Player List Popover */}
      {showPlayersList && (
        <div className="mb-2 w-72 sm:w-80 bg-[#121118]/95 border border-white/20 rounded-xl p-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 text-white">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <Users className="w-4 h-4" />
              <span>Jogadores no Reino ({onlineList.length + 1})</span>
            </div>
            <button 
              onClick={() => setShowPlayersList(false)}
              className="p-1 text-white/50 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {/* Self */}
            <div className="p-2 rounded-lg bg-white/5 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCreator ? (
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    {myUsername} <span className="text-[10px] text-amber-400 font-mono">(Tu)</span>
                  </div>
                  <div className="text-[10px] text-white/50 font-mono">
                    Coord: {Math.round(playerCoords.x)}, {Math.round(playerCoords.z)}
                  </div>
                </div>
              </div>
              {isCreator && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  CRIADOR
                </span>
              )}
            </div>

            {/* Remote Players */}
            {onlineList.map(player => {
              const dist = Math.hypot(player.pos[0] - playerCoords.x, player.pos[2] - playerCoords.z);
              return (
                <div 
                  key={player.id}
                  className="p-2 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {player.isCreator ? (
                      <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                    <div>
                      <div className="text-xs font-medium text-white flex items-center gap-1">
                        {player.username}
                        {player.isCreator && (
                          <span className="text-[9px] text-amber-300 font-mono">👑</span>
                        )}
                      </div>
                      <div className="text-[10px] text-white/40 font-mono">
                        {player.dragon?.name || 'Dragão'} • {Math.round(dist)}m
                      </div>
                    </div>
                  </div>

                  {onTeleportNearPlayer && (
                    <button
                      onClick={() => onTeleportNearPlayer(player.pos)}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] text-cyan-300 font-mono"
                      title="Voar até ao jogador"
                    >
                      Ir Até
                    </button>
                  )}
                </div>
              );
            })}

            {onlineList.length === 0 && (
              <div className="p-3 text-center text-xs text-white/40 font-mono">
                És o primeiro neste reino! Convida amigos ou abre outra aba para voarem juntos!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Box */}
      {isOpen ? (
        <div className="w-80 sm:w-96 bg-[#0e0d14]/95 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-[#121118] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Chat do Reino
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/70">
                {currentRoom}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowPlayersList(!showPlayersList)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono flex items-center gap-1.5 text-white/80 transition-colors"
                title="Lista de Jogadores Online"
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>{onlineList.length + 1}</span>
              </button>

              <button
                onClick={handleOpen}
                className="p-1 text-white/50 hover:text-white rounded hover:bg-white/10"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="p-3 h-52 overflow-y-auto space-y-2 text-xs font-sans">
            {chatMessages.map(msg => (
              <div key={msg.id} className="leading-snug">
                {msg.type === 'system' ? (
                  <div className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded font-mono">
                    📢 {msg.message}
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] text-white/40 font-mono mr-1.5">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`font-bold mr-1.5 ${
                      msg.isCreator 
                        ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                        : 'text-cyan-300'
                    }`}>
                      {msg.isCreator && '👑 '}
                      {msg.username}:
                    </span>
                    <span className="text-white/90 break-words">{msg.message}</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Emote Actions */}
          <div className="px-3 py-1.5 border-t border-white/5 bg-black/30 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleQuickEmote('🔥 Rugido do Titã!', 'roar')}
              className="px-2 py-0.5 rounded bg-orange-600/30 hover:bg-orange-600/50 text-orange-200 border border-orange-500/30 whitespace-nowrap transition-colors"
            >
              🔥 Rugir
            </button>
            <button
              onClick={() => handleQuickEmote('🐉 Venham voar em formação!')}
              className="px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/30 whitespace-nowrap transition-colors"
            >
              💨 Voar Juntos
            </button>
            <button
              onClick={() => handleQuickEmote(`📍 Estou em (${Math.round(playerCoords.x)}, ${Math.round(playerCoords.z)})`)}
              className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/30 whitespace-nowrap transition-colors"
            >
              📍 Coordenadas
            </button>
            {isCreator && (
              <button
                onClick={() => handleQuickEmote('👑 Salve o Reino dos Dragões!')}
                className="px-2 py-0.5 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/30 whitespace-nowrap transition-colors"
              >
                👑 Bênção
              </button>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2 border-t border-white/10 bg-[#121118] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Mensagem para o reino..."
              maxLength={150}
              className="flex-1 bg-black/50 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold hover:brightness-110 disabled:opacity-40 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Button collapsed */
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpen}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[#0f0e15]/90 border border-white/20 text-white shadow-2xl backdrop-blur-md hover:bg-white/10 transition-all group"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-mono font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                Chat Multiplayer
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-white/50 font-mono">
                {onlineList.length + 1} online no reino
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowPlayersList(!showPlayersList)}
            className="p-2.5 rounded-2xl bg-[#0f0e15]/90 border border-white/20 text-cyan-400 shadow-2xl backdrop-blur-md hover:bg-white/10 transition-all"
            title="Ver jogadores online"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
