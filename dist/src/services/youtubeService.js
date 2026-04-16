"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollYouTube = void 0;
const axios_1 = __importDefault(require("axios"));
const VideoMetadata_1 = __importDefault(require("../models/VideoMetadata"));
const notificationService_1 = require("./notificationService");
const pollYouTube = async () => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    if (!apiKey || !channelId) {
        console.warn('YouTube polling skipped: Missing API Key or Channel ID in .env');
        return;
    }
    console.log('Polling YouTube...');
    try {
        const response = await axios_1.default.get('https://www.googleapis.com/youtube/v3/search', {
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
            if (!videoId)
                continue;
            const title = item.snippet.title;
            const liveBroadcastContent = item.snippet.liveBroadcastContent; // 'live', 'upcoming', 'none'
            const [metadata, created] = await VideoMetadata_1.default.findOrCreate({
                where: { videoId },
                defaults: { lastStatus: liveBroadcastContent, videoId: videoId }
            });
            if (created) {
                if (liveBroadcastContent === 'live') {
                    await (0, notificationService_1.sendNotificationToAll)('Dominion TV is LIVE!', title, { videoId, type: 'live' });
                }
                else if (liveBroadcastContent === 'none') {
                    await (0, notificationService_1.sendNotificationToAll)('New Video Uploaded!', title, { videoId, type: 'video' });
                }
            }
            else if (metadata.lastStatus !== 'live' && liveBroadcastContent === 'live') {
                await (0, notificationService_1.sendNotificationToAll)('Dominion TV is LIVE!', title, { videoId, type: 'live' });
            }
            if (metadata.lastStatus !== liveBroadcastContent) {
                await metadata.update({ lastStatus: liveBroadcastContent });
            }
        }
    }
    catch (error) {
        console.error('YouTube Polling Error:', error.response?.data || error.message);
    }
};
exports.pollYouTube = pollYouTube;
