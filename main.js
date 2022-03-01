import { randomUUID } from "crypto";
import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000, clientTracking: true });

// function handleProtocols(protocols, request) {
//     console.log(protocols);
//     // console.log(request);
// }

function heartbeat() {
    this.isAlive = true;
}

const pingInterval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

const CANVAS_DATA = new Object();
const allowedEntries = ['to', 'answer', 'offer', 'join', 'ice', 'stop', 'hello', 'msg']

wss.on('connection', function connection(ws) {
    ws.on('pong', heartbeat);
    ws.rooms = new Set();
    ws.id = randomUUID();
    ws.send(JSON.stringify({ id: ws.id }));
    ws.on('close', () => broadcast(ws, { disconnected: ws.id }));

    if (ws.protocol === 'draw') {
        ws.on('message', function message(rawData, isBinary) {
            let data;
            try {
                data = JSON.parse(rawData);
                data = Object.fromEntries(Object.entries(data).filter(([k, v]) => v != null && ['join', 'leave', 'line', 'clear', 'pop'].includes(k)));
            } catch (error) {
                ws.send('Error parsing JSON, terminating!')
                ws.terminate();
                return;
            }
            if (data.join) {
                if (!CANVAS_DATA[data.join]) {
                    CANVAS_DATA[data.join] = { lines: [], texts: [] };
                    // remove the 
                    setTimeout(() => {
                        delete CANVAS_DATA[data.join];
                        console.warn("Removing the canvas room with id ", data.join, "after five day.");
                    },
                        5 * 24 * 60 * 60 * 1000
                    )
                }
                ws.rooms = new Set([data.join]);
                ws.room = data.join;
                ws.send(JSON.stringify({ line: CANVAS_DATA[data.join] }))
            }
            if (data.line) {
                CANVAS_DATA[ws.room].lines.push(data.line)
                data.line = CANVAS_DATA[ws.room]
            }
            if (data.clear) {
                CANVAS_DATA[data.clear].lines = [];
                CANVAS_DATA[data.clear].texts = [];
            }
            if (data.pop) {
                CANVAS_DATA[data.pop].lines.pop();
                wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN && client.protocol === ws.protocol && intersect(ws.rooms, client.rooms)) {
                        client.send(JSON.stringify({ clear: 'pop', line: CANVAS_DATA[data.pop] }));
                    }
                });
            }

            broadcast(ws, data);
        });

    } else if (['chat', 'screen', 'files'].includes(ws.protocol)) {
        ws.on('message', function message(rawData, isBinary) {
            let data;
            try {
                data = JSON.parse(rawData);
                data = Object.fromEntries(Object.entries(data).filter(([k, v]) => v != null && allowedEntries.includes(k)));
            } catch (error) {
                ws.send('Error parsing JSON, terminating!')
                ws.terminate();
                return;
            }
            if (data.join) {
                ws.rooms.add(data.join);
                ws.send(JSON.stringify({ users: getUsers(ws) }))
            }

            broadcast(ws, data);
        });
    } else {
        console.warn('Closed Socket, unknown Protocol!');
        ws.send('Closed Socket, unknown Protocol!');
        ws.close();
    }



});

wss.on('close', function close() {
    clearInterval(pingInterval);
});

function broadcast(ws, d) {
    const data = { ...d, from: ws.id, users: getUsers(ws) };
    wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN && client.protocol === ws.protocol && intersect(ws.rooms, client.rooms)) {
            if (data.to) {
                if (client.id === data.to) {
                    client.send(JSON.stringify(data));
                }
            } else {
                client.send(JSON.stringify(data));
            }
        }
    });
}

function intersect(a, b) {
    return new Set([...a].filter(i => b.has(i))).size > 0;
}

function getCount(ws) {
    return [...wss.clients].filter(c => c.protocol === ws.protocol && intersect(c.rooms, ws.rooms)).length;
}

function getUsers(ws) {
    return [...wss.clients].filter(c => c.protocol === ws.protocol && intersect(c.rooms, ws.rooms)).map(c => c.id);
}