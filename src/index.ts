import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { pollYouTube } from './services/youtubeService.js';
import morgan from "morgan"

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"))

// Routes
app.get('/', (req, res) => res.status(200).json({ error: false, message: "server running" }));
app.use('/api/notifications', notificationRoutes);

// const PORT = Number(process.env.PORT || 4000);
const PORT = Number(process.env.PORT || process.env.PASSENGER_APP_PORT || 3000);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // await sequelize.sync();
    console.log('Models synchronized.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend server running on port ${PORT}`);

      // Start background services
      setInterval(pollYouTube, 60 * 1000 * 5);
      pollYouTube();
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
