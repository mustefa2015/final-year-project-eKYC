// backend/middleware/authMiddleware.js

import mongoose from 'mongoose';
import { getModels } from '../models/index.js';

export const validateApiKey = async (req, res, next) => {
  const { ApiKey } = getModels();

  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      docs: 'Include your API key in the x-api-key header or apiKey query parameter.',
    });
  }

  try {
    const keyRecord = await ApiKey.findOne({ key: apiKey, isActive: true }).populate('client');

    if (!keyRecord) {
      return res.status(403).json({
        error: 'Invalid API key',
        docs: 'Request a valid key from the developer portal.',
      });
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return res.status(403).json({
        error: 'API key expired',
        docs: 'Please renew your API key.',
      });
    }

    // Attach verified info to request object
    req.client = keyRecord.client;
    req.apiKey = keyRecord;

    // Update usage tracking
    keyRecord.lastUsed = new Date();
    keyRecord.usageCount += 1;
    await keyRecord.save();

    // To ensure API is avalible in nested calls
    res.locals.apiKey = keyRecord;
    next();
  } catch (error) {
    console.error('API Key Validation Error:', error);
    res.status(500).json({ error: 'Internal server error during API key validation.' });
  }
};
