import express from 'express';
import { getUserData } from '../Controllers/callResultController.js';

const router = express.Router();

// POST endpoint for fetching user data
router.post('/', getUserData);

export default router;