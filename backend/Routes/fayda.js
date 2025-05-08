// backend/Routes/fayda.js

import express from 'express';
import {
  sendOtp,
  verifyOtp,
  userInfo,
} from '../Controllers/faydaController.js';
import { validateApiKey } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Middleware: API Key Validation
router.use(validateApiKey);

// Middleware: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per API key per window
  keyGenerator: (req) => req.apiKey?.id || '', // Use API key's id
  message: 'Too many requests from this API key, please try again later.',
});

router.use(apiLimiter);

// Routes
router.post('/sendOtp', sendOtp);
router.post('/verifyOtp', verifyOtp);
router.post('/userInfo', userInfo);

export default router;
