import axios from 'axios';
import VideoMetadata from '../models/VideoMetadata';
import { sendNotificationToAll } from './notificationService';

export const pollYouTube = async () => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    console.warn('YouTube polling skipped: Missing API Key or Channel ID in .env');
    return;
  }
  console.log('Polling YouTube...');

  try {
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

      const [ metadata, created ] = await VideoMetadata.findOrCreate({
        where: { videoId },
        defaults: { lastStatus: liveBroadcastContent }
      });

      if (created) {
        if (liveBroadcastContent === 'live') {
          await sendNotificationToAll('Dominion TV is LIVE!', title, { videoId, type: 'live' });
        } else if (liveBroadcastContent === 'none') {
          await sendNotificationToAll('New Video Uploaded!', title, { videoId, type: 'video' });
        }
      } else if (metadata.lastStatus !== 'live' && liveBroadcastContent === 'live') {
        await sendNotificationToAll('Dominion TV is LIVE!', title, { videoId, type: 'live' });
      }

      if (metadata.lastStatus !== liveBroadcastContent) {
        await metadata.update({ lastStatus: liveBroadcastContent });
      }
    }
  } catch (error: any) {
    console.error('YouTube Polling Error:', error.response?.data || error.message);
  }
};
