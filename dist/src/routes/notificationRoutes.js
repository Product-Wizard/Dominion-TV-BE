"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_js_1 = require("../controllers/notificationController.js");
const router = (0, express_1.Router)();
router.post('/register-token', notificationController_js_1.registerToken);
router.post('/test', notificationController_js_1.testNotification);
exports.default = router;
