var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_http = __toESM(require("http"), 1);
var import_ws = require("ws");
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var PORT = Number(process.env.PORT) || 3e3;
var app = (0, import_express.default)();
var server = import_http.default.createServer(app);
app.use(import_express.default.json());
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", serverTime: Date.now() });
});
var players = /* @__PURE__ */ new Map();
var chatHistories = /* @__PURE__ */ new Map();
var MASTER_CREATOR_EMAIL = "franciscomariacastanh@gmail.com";
function getRoomChat(room) {
  if (!chatHistories.has(room)) {
    chatHistories.set(room, [
      {
        id: "welcome_system",
        senderId: "server",
        username: "Servidor Drac\xF4nico",
        isCreator: false,
        message: "Bem-vindo ao Reino dos Drag\xF5es Multiplayer! Explora os c\xE9us, voa com outros jogadores e conquista os 6 biomas!",
        timestamp: Date.now(),
        type: "system"
      }
    ]);
  }
  return chatHistories.get(room);
}
function broadcastToRoom(room, payload, excludePlayerId) {
  const messageStr = JSON.stringify(payload);
  for (const [id, client] of players.entries()) {
    if (client.data.room === room && id !== excludePlayerId && client.ws.readyState === import_ws.WebSocket.OPEN) {
      try {
        client.ws.send(messageStr);
      } catch (err) {
        console.error("Failed to send to client", id, err);
      }
    }
  }
}
var wss = new import_ws.WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => {
  let boundPlayerId = null;
  let boundRoom = "reino-central";
  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.type === "join") {
        boundPlayerId = data.playerId;
        boundRoom = data.room || "reino-central";
        const isMasterCreator = data.email && data.email.toLowerCase() === MASTER_CREATOR_EMAIL.toLowerCase() || data.isCreator === true;
        const playerData = {
          id: data.playerId,
          username: data.username || (isMasterCreator ? "Francisco (Criador Tit\xE3)" : "Cavaleiro Drac\xF4nico"),
          email: data.email || "",
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
        const roomPlayers = [];
        for (const [id, client] of players.entries()) {
          if (id !== boundPlayerId && client.data.room === boundRoom) {
            roomPlayers.push(client.data);
          }
        }
        ws.send(JSON.stringify({
          type: "init",
          yourId: boundPlayerId,
          isCreator: isMasterCreator,
          players: roomPlayers,
          chatHistory: getRoomChat(boundRoom),
          serverTime: Date.now()
        }));
        broadcastToRoom(boundRoom, {
          type: "player_joined",
          player: playerData
        }, boundPlayerId);
        const joinMsg = {
          id: `msg_join_${Date.now()}_${Math.random()}`,
          senderId: "server",
          username: "Servidor",
          isCreator: false,
          message: isMasterCreator ? `\u{1F451} [MESTRE SUPREMO] Francisco Maria Castanha entrou no reino com poderes de Criador Tit\xE3!` : `\u{1F409} ${playerData.username} juntou-se ao reino!`,
          timestamp: Date.now(),
          type: "system"
        };
        const chatList = getRoomChat(boundRoom);
        chatList.push(joinMsg);
        if (chatList.length > 60) chatList.shift();
        broadcastToRoom(boundRoom, { type: "chat_message", message: joinMsg });
      } else if (data.type === "move" && boundPlayerId && players.has(boundPlayerId)) {
        const client = players.get(boundPlayerId);
        client.data.pos = data.pos;
        client.data.rot = data.rot;
        client.data.state = data.state;
        client.data.lastSeen = Date.now();
        broadcastToRoom(boundRoom, {
          type: "player_moved",
          playerId: boundPlayerId,
          pos: data.pos,
          rot: data.rot,
          state: data.state,
          timestamp: Date.now()
        }, boundPlayerId);
      } else if (data.type === "action" && boundPlayerId && players.has(boundPlayerId)) {
        const client = players.get(boundPlayerId);
        if (data.actionType === "dragon_change") {
          client.data.dragon = data.payload.dragon;
        } else if (data.actionType === "rider_change") {
          client.data.rider = data.payload.rider;
        }
        broadcastToRoom(boundRoom, {
          type: "player_action",
          playerId: boundPlayerId,
          actionType: data.actionType,
          payload: data.payload,
          timestamp: Date.now()
        }, boundPlayerId);
      } else if (data.type === "chat" && boundPlayerId && players.has(boundPlayerId)) {
        const client = players.get(boundPlayerId);
        const msgText = String(data.message || "").trim().slice(0, 200);
        if (!msgText) return;
        const newMsg = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          senderId: boundPlayerId,
          username: client.data.username,
          isCreator: client.data.isCreator,
          message: msgText,
          timestamp: Date.now(),
          type: "chat"
        };
        const roomChat = getRoomChat(boundRoom);
        roomChat.push(newMsg);
        if (roomChat.length > 60) roomChat.shift();
        broadcastToRoom(boundRoom, {
          type: "chat_message",
          message: newMsg
        });
      } else if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
      }
    } catch (err) {
      console.error("Error handling WebSocket message", err);
    }
  });
  ws.on("close", () => {
    if (boundPlayerId && players.has(boundPlayerId)) {
      const leavingPlayer = players.get(boundPlayerId).data;
      players.delete(boundPlayerId);
      broadcastToRoom(boundRoom, {
        type: "player_left",
        playerId: boundPlayerId
      });
      const leaveMsg = {
        id: `msg_leave_${Date.now()}_${Math.random()}`,
        senderId: "server",
        username: "Servidor",
        isCreator: false,
        message: `${leavingPlayer.username} saiu do reino.`,
        timestamp: Date.now(),
        type: "system"
      };
      const roomChat = getRoomChat(boundRoom);
      roomChat.push(leaveMsg);
      if (roomChat.length > 60) roomChat.shift();
      broadcastToRoom(boundRoom, { type: "chat_message", message: leaveMsg });
    }
  });
  ws.on("error", (err) => {
    console.error("WebSocket client error", err);
  });
});
setInterval(() => {
  const now = Date.now();
  for (const [id, client] of players.entries()) {
    if (now - client.data.lastSeen > 6e4 || client.ws.readyState === import_ws.WebSocket.CLOSED) {
      try {
        client.ws.terminate();
      } catch {
      }
      players.delete(id);
      broadcastToRoom(client.data.room, {
        type: "player_left",
        playerId: id
      });
    }
  }
}, 15e3);
var isProduction = process.env.NODE_ENV === "production";
async function start() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.resolve(__dirname, "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.resolve(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Dragon Realm server running on port ${PORT} [mode: ${isProduction ? "production" : "development"}]`);
  });
}
start().catch((err) => {
  console.error("Fatal server boot error:", err);
  process.exit(1);
});
