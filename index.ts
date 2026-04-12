import express from 'express';
import cors from 'cors';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import dotenv from 'dotenv';
import { Sequelize, DataTypes } from 'sequelize';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const expo = new Expo();

// Database setup
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite:./database.sqlite', {
  logging: false,
});

const PushToken = sequelize.define('PushToken', {
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

const VideoMetadata = sequelize.define('VideoMetadata', {
  videoId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  lastStatus: {
    type: DataTypes.STRING, // 'live', 'upcoming', 'none'
    allowNull: true,
  }
});

app.post('/api/notifications/register-token', async (req, res) => {
  const { token, deviceId, userId } = req.body;

  if (!token || !deviceId) {
    return res.status(400).json({ error: 'Token and DeviceId are required' });
  }

  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).json({ error: 'Invalid Expo push token' });
  }

  try {
    // Upsert based on deviceId to avoid redundant entries
    await (PushToken as any).upsert({ deviceId, token, userId });
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving token:', error);
    res.status(500).json({ error: 'Failed to save token' });
  }
});

// Function to send notifications to all users
async function sendNotificationToAll(title: string, message: string, data: any) {
  const tokens = await PushToken.findAll();
  const pushMessages: ExpoPushMessage[] = tokens.map(t => ({
    to: t.get('token') as string,
    sound: 'default',
    title,
    body: message,
    data,
  }));

  const chunks = expo.chunkPushNotifications(pushMessages);
  const tickets: ExpoPushTicket[] = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (e) {
      console.error('Error sending chunk:', e);
    }
  }

  // Handle tickets to clean up invalid tokens
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[ i ];
    if (ticket.status === 'error') {
      if (ticket.details && ticket.details.error === 'DeviceNotRegistered') {
        const token = pushMessages[ i ].to as string;
        console.log(`Token ${token} is not registered anymore, removing...`);
        await PushToken.destroy({ where: { token } });
      }
    }
  }

  return tickets;
}

// Manual trigger for testing
app.post('/api/notifications/test', async (req, res) => {
  const { title, body, data } = req.body;
  await sendNotificationToAll(title || 'Test Notification', body || 'Test message', data || { type: 'test' });
  res.json({ success: true });
});

// Polling service for YouTube channel
async function pollYouTube() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    console.warn('YouTube polling skipped: Missing API Key or Channel ID in .env');
    return;
  }
  console.log('Pooling YouTube');

  try {
    // Search for latest videos and live streams
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        channelId: channelId,
        order: 'date',
        maxResults: 5,
        key: apiKey,
      }
    });

    const items = response.data.items;
    for (const item of items) {
      const videoId = item.id.videoId;
      if (!videoId) continue;

      const title = item.snippet.title;
      const liveBroadcastContent = item.snippet.liveBroadcastContent; // 'live', 'upcoming', 'none'

      const [ metadata, created ] = await (VideoMetadata as any).findOrCreate({
        where: { videoId },
        defaults: { lastStatus: liveBroadcastContent }
      });

      if (created) {
        if (liveBroadcastContent === 'live') {
          await sendNotificationToAll('Dominion TV is LIVE!', title, { videoId, type: 'live' });
        } else if (liveBroadcastContent === 'none') {
          await sendNotificationToAll('New Video Uploaded!', title, { videoId, type: 'video' });
        }
      } else if (metadata.get('lastStatus') !== 'live' && liveBroadcastContent === 'live') {
        await sendNotificationToAll('Dominion TV is LIVE!', title, { videoId, type: 'live' });
      }

      if (metadata.get('lastStatus') !== liveBroadcastContent) {
        await metadata.update({ lastStatus: liveBroadcastContent });
      }
    }
  } catch (error: any) {
    console.error('YouTube Polling Error:', error.response?.data || error.message);
  }
}

const PORT = process.env.PORT || 4000;

sequelize.authenticate().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT}`);
    setInterval(pollYouTube, 60 * 1000);
    pollYouTube();
  });
}).catch((error: any) => {
  console.log("Error starting server...");
  console.log("Error: ", error)
});
