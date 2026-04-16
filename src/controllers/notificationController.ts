import { Request, Response } from 'express';
import { Expo } from 'expo-server-sdk';
import PushToken from '../models/PushToken.js';
import { sendNotificationToAll } from '../services/notificationService.js';

export const registerToken = async (req: Request, res: Response) => {
  const { token, deviceId, userId } = req.body;

  if (!token || !deviceId) {
    return res.status(400).json({ error: 'Token and DeviceId are required' });
  }

  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).json({ error: 'Invalid Expo push token' });
  }

  try {
    await PushToken.upsert({ deviceId, token, userId });
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving token:', error);
    res.status(500).json({ error: 'Failed to save token' });
  }
};

export const testNotification = async (req: Request, res: Response) => {
  const { title, body, data } = req.body;
  try {
    await sendNotificationToAll(title || 'Test Notification', body || 'Test message', data || { type: 'test' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
};
