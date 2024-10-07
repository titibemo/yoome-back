require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const http = require('http')
const WebSocket = require("ws");
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();


app.use(cors());
app.use(cors({ origin: "http://localhost:8080" }));
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME

})

db.connect((err) => {
    if (err) {
        console.log('Database connection failed !!!')
    } else {
        console.log('Connected to database');

    }
})


const profilRoutes = require('./routes/profiles');
const userRoutes = require('./routes/users');
const personalizationsRoutes = require('./routes/personalizations');
const likesRoutes = require('./routes/likes');
const channelsRoutes = require('./routes/channels');

app.use('/api/users', userRoutes)
app.use('/api/profiles', profilRoutes)
app.use('/api/personalizations', personalizationsRoutes)
app.use('/api/likes', likesRoutes)
app.use('/api/channels', channelsRoutes)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('SERVEUR DEMARRE')
})


const server = http.createServer(app);

const websocketServer = new WebSocket.Server({ server });

//Listen for WebSocket connections
websocketServer.on('connection', (socket) => {
    // Log a message when a new client connects
    console.log('client connected.');
    // Listen for incoming WebSocket messages
    socket.on('message', (data) => {

        // Broadcast the message to all connected clients
        websocketServer.clients.forEach(function each(client) {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
                // console.log("message",data.toString())
            }
        });
    });
    // Listen for WebSocket connection close events
    socket.on('close', () => {
        // Log a message when a client disconnects
        console.log('Client disconnected');
    });
});