import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const app = express();
const server = http.createServer(app);

app.use(express.json());

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', serverTime: Date.now() });
});

// Active online players state
interface PlayerData {
  id: string;
  username: string;
  email: string;
  isCreator: boolean;
  room: string;
  dragon: any;
  rider: any;
  pos: [number, number, number];
  rot: [number, number, number];
  state: {
    isFlying: boolean;
    isMounted: boolean;
    isGliding: boolean;
    isRunning: boolean;
    speed: number;
    isAttacking?: boolean;
    isRoaring?: boolean;
  };
  lastSeen: number;
}

const players = new Map<string, { ws: WebSocket; data: PlayerData }>();
const chatHistories = new Map<string, Array<{
  id: string;
  senderId: string;
  username: string;
  isCreator: boolean;
  message: string;
  timestamp: number;
  type: 'chat' | 'system' | 'action';
}>>();

const MASTER_CREATOR_EMAIL = 'franciscomariacastanh@gmail.com';

function getRoomChat(room: string) {
  if (!chatHistories.has(room)) {
    chatHistories.set(room, [
      {
        id: 'welcome_system',
        senderId: 'server',
        username: 'Servidor Dracônico',
        isCreator: false,
        message: 'Bem-vindo ao Reino dos Dragões Multiplayer! Explora os céus, voa com outros jogadores e conquista os 6 biomas!',
        timestamp: Date.now(),
        type: 'system'
      }
    ]);
  }
  return chatHistories.get(room)!;
}

function broadcastToRoom(room: string, payload: any, excludePlayerId?: string) {
  const messageStr = JSON.stringify(payload);
  for (const [id, client] of players.entries()) {
    if (client.data.room === room && id !== excludePlayerId && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(messageStr);
      } catch (err) {
        console.error('Failed to send to client', id, err);
      }
    }
  }
}

// WebSocket Server attached to same HTTP server on path /ws
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  let boundPlayerId: string | null = null;
  let boundRoom: string = 'reino-central';

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === 'join') {
        boundPlayerId = data.playerId;
        boundRoom = data.room || 'reino-central';

        // Check if creator (Francisco Maria Castanha)
        const isMasterCreator = (data.email && data.email.toLowerCase() === MASTER_CREATOR_EMAIL.toLowerCase()) || data.isCreator === true;

        const playerData: PlayerData = {
          id: data.playerId,
          username: data.username || (isMasterCreator ? 'Francisco (Criador Titã)' : 'Cavaleiro Dracônico'),
          email: data.email || '',
          isCreator: isMasterCreator,
          room: boundRoom,
          dragon: data.dragon,
          rider: data.rider,
          pos: data.pos || [0, 3.5, 0],
          rot: data.rot || [0, 0, 0],
          state: data.state || {
            isFlying: false,
            isMounted: true,
            isGliding: false,
            isRunning: false,
            speed: 0
          },
          lastSeen: Date.now()
        };

        players.set(boundPlayerId, { ws, data: playerData });

        // Retrieve existing players in this room
        const roomPlayers: PlayerData[] = [];
        for (const [id, client] of players.entries()) {
          if (id !== boundPlayerId && client.data.room === boundRoom) {
            roomPlayers.push(client.data);
          }
        }

        // Send initial state to the newcomer
        ws.send(JSON.stringify({
          type: 'init',
          yourId: boundPlayerId,
          isCreator: isMasterCreator,
          players: roomPlayers,
          chatHistory: getRoomChat(boundRoom),
          serverTime: Date.now()
        }));

        // Broadcast join to others in room
        broadcastToRoom(boundRoom, {
          type: 'player_joined',
          player: playerData
        }, boundPlayerId);

        // System announcement
        const joinMsg = {
          id: `msg_join_${Date.now()}_${Math.random()}`,
          senderId: 'server',
          username: 'Servidor',
          isCreator: false,
          message: isMasterCreator 
            ? `👑 [MESTRE SUPREMO] Francisco Maria Castanha entrou no reino com poderes de Criador Titã!`
            : `🐉 ${playerData.username} juntou-se ao reino!`,
          timestamp: Date.now(),
          type: 'system' as const
        };
        const chatList = getRoomChat(boundRoom);
        chatList.push(joinMsg);
        if (chatList.length > 60) chatList.shift();
        broadcastToRoom(boundRoom, { type: 'chat_message', message: joinMsg });

      } else if (data.type === 'move' && boundPlayerId && players.has(boundPlayerId)) {
        const client = players.get(boundPlayerId)!;
        client.data.pos = data.pos;
        client.data.rot = data.rot;
        client.data.state = data.state;
        client.data.lastSeen = Date.now();

        // Broadcast position delta to others in the same room
        broadcastToRoom(boundRoom, {
          type: 'player_moved',
          playerId: boundPlayerId,
          pos: data.pos,
          rot: data.rot,
          state: data.state,
          timestamp: Date.now()
        }, boundPlayerId);

      } else if (data.type === 'action' && boundPlayerId && players.has(boundPlayerId)) {
        const client = players.get(boundPlayerId)!;
        if (data.actionType === 'dragon_change') {
          client.data.dragon = data.payload.dragon;
        } else if (data.actionType === 'rider_change') {
          client.data.rider = data.payload.rider;
        }

        broadcastToRoom(boundRoom, {
          type: 'player_action',
          playerId: boundPlayerId,
          actionType: data.actionType,
          payload: data.payload,
          timestamp: Date.now()
        }, boundPlayerId);

      } else if (data.type === 'chat' && boundPlayerId && players.has(boundPlayerId)) {
        const client = players.get(boundPlayerId)!;
        const msgText = String(data.message || '').trim().slice(0, 200);
        if (!msgText) return;

        const newMsg = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          senderId: boundPlayerId,
          username: client.data.username,
          isCreator: client.data.isCreator,
          message: msgText,
          timestamp: Date.now(),
          type: 'chat' as const
        };

        const roomChat = getRoomChat(boundRoom);
        roomChat.push(newMsg);
        if (roomChat.length > 60) roomChat.shift();

        // Send to everyone in room including sender
        broadcastToRoom(boundRoom, {
          type: 'chat_message',
          message: newMsg
        });

      } else if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (err) {
      console.error('Error handling WebSocket message', err);
    }
  });

  ws.on('close', () => {
    if (boundPlayerId && players.has(boundPlayerId)) {
      const leavingPlayer = players.get(boundPlayerId)!.data;
      players.delete(boundPlayerId);

      broadcastToRoom(boundRoom, {
        type: 'player_left',
        playerId: boundPlayerId
      });

      const leaveMsg = {
        id: `msg_leave_${Date.now()}_${Math.random()}`,
        senderId: 'server',
        username: 'Servidor',
        isCreator: false,
        message: `${leavingPlayer.username} saiu do reino.`,
        timestamp: Date.now(),
        type: 'system' as const
      };
      const roomChat = getRoomChat(boundRoom);
      roomChat.push(leaveMsg);
      if (roomChat.length > 60) roomChat.shift();
      broadcastToRoom(boundRoom, { type: 'chat_message', message: leaveMsg });
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error', err);
  });
});

// Periodic heartbeat / cleanup
setInterval(() => {
  const now = Date.now();
  for (const [id, client] of players.entries()) {
    if (now - client.data.lastSeen > 60000 || client.ws.readyState === WebSocket.CLOSED) {
      try {
        client.ws.terminate();
      } catch {}
      players.delete(id);
      broadcastToRoom(client.data.room, {
        type: 'player_left',
        playerId: id
      });
    }
  }
}, 15000);

const isProduction = process.env.NODE_ENV === 'production';

async function start() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Dragon Realm server running on port ${PORT} [mode: ${isProduction ? 'production' : 'development'}]`);
  });
}

start().catch(err => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
