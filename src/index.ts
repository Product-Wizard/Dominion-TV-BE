import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './config/database';
import notificationRoutes from './routes/notificationRoutes';
import { pollYouTube } from './services/youtubeService';
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
app.use('/api/notifications', notificationRoutes);

const PORT = Number(process.env.PORT || 4000);

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
