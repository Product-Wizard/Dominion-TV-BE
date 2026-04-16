import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import PushToken from '../models/PushToken.js';

const expo = new Expo();

export const sendNotificationToAll = async (title: string, message: string, data: any) => {
  const tokens = await PushToken.findAll();
  const pushMessages: ExpoPushMessage[] = tokens.map(t => ({
    to: t.token,
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
};
