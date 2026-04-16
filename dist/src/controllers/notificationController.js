"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testNotification = exports.registerToken = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
const PushToken_js_1 = __importDefault(require("../models/PushToken.js"));
const notificationService_js_1 = require("../services/notificationService.js");
const registerToken = async (req, res) => {
    const { token, deviceId, userId } = req.body;
    if (!token || !deviceId) {
        return res.status(400).json({ error: 'Token and DeviceId are required' });
    }
    if (!expo_server_sdk_1.Expo.isExpoPushToken(token)) {
        return res.status(400).json({ error: 'Invalid Expo push token' });
    }
    try {
        await PushToken_js_1.default.upsert({ deviceId, token, userId });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error saving token:', error);
        res.status(500).json({ error: 'Failed to save token' });
    }
};
exports.registerToken = registerToken;
const testNotification = async (req, res) => {
    const { title, body, data } = req.body;
    try {
        await (0, notificationService_js_1.sendNotificationToAll)(title || 'Test Notification', body || 'Test message', data || { type: 'test' });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
};
exports.testNotification = testNotification;
