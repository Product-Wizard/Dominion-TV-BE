import { Router } from 'express';
import { registerToken, testNotification } from '../controllers/notificationController.js';

const router = Router();

router.post('/register-token', registerToken);
router.post('/test', testNotification);

export default router;
