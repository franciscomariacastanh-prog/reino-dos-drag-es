import { useState, useEffect, useRef, useCallback } from 'react';
import { RemotePlayer, MultiplayerChatMessage, Dragon, RiderCustomizationState, UserProfile } from '../types';

interface UseMultiplayerOptions {
  userProfile: UserProfile;
  activeDragon: Dragon;
  riderCustomization: RiderCustomizationState;
  room?: string;
  enabled?: boolean;
}

export function useMultiplayer({
  userProfile,
  activeDragon,
  riderCustomization,
  room = 'reino-central',
  enabled = true
}: UseMultiplayerOptions) {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [remotePlayers, setRemotePlayers] = useState<Map<string, RemotePlayer>>(new Map());
  const [chatMessages, setChatMessages] = useState<MultiplayerChatMessage[]>([]);
  const [pingMs, setPingMs] = useState<number>(18);
  const [currentRoom, setCurrentRoom] = useState<string>(room);

  const socketRef = useRef<WebSocket | null>(null);
  const myPlayerIdRef = useRef<string>(userProfile.id);
  const lastSendMoveTime = useRef<number>(0);
  const reconnectTimeoutRef = useRef<any>(null);
  const pingStartRef = useRef<number>(0);
  const remotePlayersRef = useRef<Map<string, RemotePlayer>>(new Map());

  // Keep references fresh
  const profileRef = useRef(userProfile);
  profileRef.current = userProfile;
  const dragonRef = useRef(activeDragon);
  dragonRef.current = activeDragon;
  const riderRef = useRef(riderCustomization);
  riderRef.current = riderCustomization;

  const connect = useCallback(() => {
    if (!enabled) return;

    // Clear any previous reconnection attempt
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      const isHttps = window.location.protocol === 'https:';
      const wsProtocol = isHttps ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

      setStatus('connecting');
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        // Send join packet
        const joinPayload = {
          type: 'join',
          playerId: profileRef.current.id,
          username: profileRef.current.username,
          email: profileRef.current.email,
          isCreator: profileRef.current.isCreator,
          room: currentRoom,
          dragon: dragonRef.current,
          rider: riderRef.current,
          pos: [0, 3.5, 0],
          rot: [0, 0, 0],
          state: {
            isFlying: false,
            isMounted: true,
            isGliding: false,
            isRunning: false,
            speed: 0
          }
        };
        ws.send(JSON.stringify(joinPayload));

        // Start ping interval
        pingStartRef.current = Date.now();
        ws.send(JSON.stringify({ type: 'ping' }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'init') {
            myPlayerIdRef.current = msg.yourId;
            const initialMap = new Map<string, RemotePlayer>();
            if (Array.isArray(msg.players)) {
              msg.players.forEach((p: any) => {
                if (p.id !== myPlayerIdRef.current) {
                  initialMap.set(p.id, {
                    ...p,
                    lastUpdate: Date.now()
                  });
                }
              });
            }
            remotePlayersRef.current = initialMap;
            setRemotePlayers(new Map(initialMap));

            if (Array.isArray(msg.chatHistory)) {
              setChatMessages(msg.chatHistory);
            }

          } else if (msg.type === 'player_joined') {
            const p = msg.player;
            if (p.id !== myPlayerIdRef.current) {
              const updated = new Map(remotePlayersRef.current);
              updated.set(p.id, {
                ...p,
                lastUpdate: Date.now()
              });
              remotePlayersRef.current = updated;
              setRemotePlayers(new Map(updated));
            }

          } else if (msg.type === 'player_moved') {
            const { playerId, pos, rot, state } = msg;
            if (playerId !== myPlayerIdRef.current) {
              const existing = remotePlayersRef.current.get(playerId);
              if (existing) {
                existing.pos = pos;
                existing.rot = rot;
                existing.state = state;
                existing.lastUpdate = Date.now();
                // We update ref continuously for smooth 60fps rendering in Three.js
              }
            }

          } else if (msg.type === 'player_action') {
            const { playerId, actionType, payload } = msg;
            if (playerId !== myPlayerIdRef.current) {
              const existing = remotePlayersRef.current.get(playerId);
              if (existing) {
                if (actionType === 'dragon_change' && payload?.dragon) {
                  existing.dragon = payload.dragon;
                } else if (actionType === 'rider_change' && payload?.rider) {
                  existing.rider = payload.rider;
                } else if (actionType === 'attack') {
                  existing.state.isAttacking = true;
                  setTimeout(() => {
                    if (existing.state) existing.state.isAttacking = false;
                  }, 800);
                } else if (actionType === 'roar') {
                  existing.state.isRoaring = true;
                  setTimeout(() => {
                    if (existing.state) existing.state.isRoaring = false;
                  }, 1200);
                }
                existing.lastUpdate = Date.now();
                setRemotePlayers(new Map(remotePlayersRef.current));
              }
            }

          } else if (msg.type === 'chat_message') {
            const newMsg: MultiplayerChatMessage = msg.message;
            setChatMessages(prev => [...prev.slice(-49), newMsg]);

            // Set chat bubble on player in 3D
            const sender = remotePlayersRef.current.get(newMsg.senderId);
            if (sender) {
              sender.lastChatMessage = newMsg.message;
              sender.chatBubbleTimer = Date.now();
              setRemotePlayers(new Map(remotePlayersRef.current));
            }

          } else if (msg.type === 'player_left') {
            const updated = new Map(remotePlayersRef.current);
            updated.delete(msg.playerId);
            remotePlayersRef.current = updated;
            setRemotePlayers(new Map(updated));

          } else if (msg.type === 'pong') {
            const latency = Math.max(5, Date.now() - pingStartRef.current);
            setPingMs(latency);
          }
        } catch (err) {
          console.error('Error parsing multiplayer message', err);
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        socketRef.current = null;
        // Schedule reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.warn('Multiplayer WebSocket error, will reconnect...', err);
        ws.close();
      };
    } catch (e) {
      console.error('Failed to create WebSocket', e);
      setStatus('disconnected');
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 4000);
    }
  }, [enabled, currentRoom]);

  // Initial connection
  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  // Regular ping to measure latency
  useEffect(() => {
    if (status !== 'connected') return;
    const interval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        pingStartRef.current = Date.now();
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [status]);

  // Clean stale players
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const updated = new Map<string, RemotePlayer>(remotePlayersRef.current);
      for (const [id, player] of updated.entries()) {
        if (now - player.lastUpdate > 25000) {
          updated.delete(id);
          changed = true;
        }
      }
      if (changed) {
        remotePlayersRef.current = updated;
        setRemotePlayers(new Map(updated));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Send movement update (throttled ~25-30Hz)
  const sendMove = useCallback((
    pos: [number, number, number],
    rot: [number, number, number],
    state: {
      isFlying: boolean;
      isMounted: boolean;
      isGliding: boolean;
      isRunning: boolean;
      speed: number;
    }
  ) => {
    const now = performance.now();
    if (now - lastSendMoveTime.current < 35) return; // ~28 packets/sec
    lastSendMoveTime.current = now;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'move',
        pos,
        rot,
        state
      }));
    }
  }, []);

  // Send action (roar, attack, emote)
  const sendAction = useCallback((actionType: string, payload: any = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'action',
        actionType,
        payload
      }));
    }
  }, []);

  // Send chat message
  const sendChat = useCallback((message: string) => {
    const clean = message.trim();
    if (!clean) return;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat',
        message: clean
      }));
    }
  }, []);

  // Sync dragon changes to server
  const broadcastDragonChange = useCallback((dragon: Dragon) => {
    sendAction('dragon_change', { dragon });
  }, [sendAction]);

  // Sync rider customization changes to server
  const broadcastRiderChange = useCallback((rider: RiderCustomizationState) => {
    sendAction('rider_change', { rider });
  }, [sendAction]);

  return {
    status,
    remotePlayers,
    remotePlayersRef,
    chatMessages,
    pingMs,
    myPlayerId: myPlayerIdRef.current,
    currentRoom,
    setCurrentRoom,
    sendMove,
    sendAction,
    sendChat,
    broadcastDragonChange,
    broadcastRiderChange
  };
}
