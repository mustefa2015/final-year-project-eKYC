// backend/Routes/organizeData.js

import express from 'express';
import { organizeData } from '../Controllers/organizeDataController.js';
import { validateApiKey } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware: API Key Validation
router.use(validateApiKey);

// Apply API Key validation
 
router.post('/', organizeData);

export default router;
