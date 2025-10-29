"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const signaling_1 = require("./signaling");
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const port = process.env.PORT || 8080;
// Serve static files from the React app
app.use(express_1.default.static(path_1.default.join(__dirname, '../dist')));
// Create signaling server
new signaling_1.SignalingServer(server);
// Handle React routing
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../dist/index.html'));
});
// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
