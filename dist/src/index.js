"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_js_1 = __importDefault(require("./config/database.js"));
const notificationRoutes_js_1 = __importDefault(require("./routes/notificationRoutes.js"));
const youtubeService_js_1 = require("./services/youtubeService.js");
const morgan_1 = __importDefault(require("morgan"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, morgan_1.default)("dev"));
// Routes
app.use('/api/notifications', notificationRoutes_js_1.default);
// const PORT = Number(process.env.PORT || 4000);
const PORT = Number(process.env.PORT || process.env.PASSENGER_APP_PORT || 3000);
const startServer = async () => {
    try {
        await database_js_1.default.authenticate();
        console.log('Database connected successfully.');
        // await sequelize.sync();
        console.log('Models synchronized.');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Backend server running on port ${PORT}`);
            // Start background services
            setInterval(youtubeService_js_1.pollYouTube, 60 * 1000 * 5);
            (0, youtubeService_js_1.pollYouTube)();
        });
    }
    catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};
startServer();
