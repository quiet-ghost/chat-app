"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const PORT = process.env.PORT || 3000;
const wss = new ws_1.WebSocketServer({ port: Number(PORT) });
const clients = [];
wss.on('connection', (ws) => {
    console.log('New client connected');
    const id = Math.random().toString(36).slice(2);
    clients.push({ id, ws });
    ws.on('message', (data) => {
        const message = JSON.parse(data);
        console.log('Received:', message);
        // Broadcast to specific client or all
        const target = clients.find((c) => c.id === message.to);
        if (target) {
            target.ws.send(JSON.stringify({ ...message, from: id }));
        }
        else {
            clients.forEach((client) => {
                if (client.id !== id) {
                    client.ws.send(JSON.stringify({ ...message, from: id }));
                }
            });
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected');
        const index = clients.findIndex((c) => c.id === id);
        clients.splice(index, 1);
    });
});
console.log(`Signaling server running on port ${PORT}`);
