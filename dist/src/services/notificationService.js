"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationToAll = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
const PushToken_js_1 = __importDefault(require("../models/PushToken.js"));
const expo = new expo_server_sdk_1.Expo();
const sendNotificationToAll = async (title, message, data) => {
    const tokens = await PushToken_js_1.default.findAll();
    const pushMessages = tokens.map(t => ({
        to: t.token,
        sound: 'default',
        title,
        body: message,
        data,
    }));
    const chunks = expo.chunkPushNotifications(pushMessages);
    const tickets = [];
    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        }
        catch (e) {
            console.error('Error sending chunk:', e);
        }
    }
    // Handle tickets to clean up invalid tokens
    for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.status === 'error') {
            if (ticket.details && ticket.details.error === 'DeviceNotRegistered') {
                const token = pushMessages[i].to;
                console.log(`Token ${token} is not registered anymore, removing...`);
                await PushToken_js_1.default.destroy({ where: { token } });
            }
        }
    }
    return tickets;
};
exports.sendNotificationToAll = sendNotificationToAll;
