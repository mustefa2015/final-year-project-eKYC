import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto'; // Import the crypto module
import { getModels } from '../models/index.js';
import { get } from 'http';
import { sendEmail } from '../Controllers/emailService.js'; 
import { sendToDeveloperCallback } from '../Controllers/callbackToDeveloper.js';


// Load environment variables
dotenv.config();
 

function getApiKey(req, res) {
  return req.apiKey?.key || res.locals.apiKey?.key || '';
}

function generateRandomSecretKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}
 

export const organizeData = async (req, res) => {
  const { Client, ApiKey, FaydaUserData } = getModels();
  const {
    FAN,
    image,
    email,
    organizationName,
    systemDescription,
    callbackURL,
    name,
    password,
    region,
    dob,
    zone,
    gender,
    woreda,
    nationality,
    phone,
    security,
    clientId,
    //apiKeyUsed
  } = req.body;

  const apiKeyUsed = getApiKey(req, res);
  if (!apiKeyUsed) {
    return res.status(401).json({
      success: false,
      message: 'API key required',
      code: 'API_KEY_REQUIRED'
    });
  }

  try {
    const isDeveloperRegistration = apiKeyUsed === process.env.DEFAULT_API_KEY;

    if (isDeveloperRegistration) {
      return await handleDeveloperRegistration(req, res);
    } else {
      return await handleEndUserRegistration(req, res);
    }
  } catch (error) {
    console.error('OrganizeData Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR',
      errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

async function handleDeveloperRegistration(req, res) {
  const { Client, ApiKey, FaydaUserData } = getModels();
  const {
    FAN,
    image,
    email,
    organizationName,
    systemDescription,
    callbackURL,
    name,
    region,
    dob,
    zone,
    gender,
    woreda,
    nationality,
    phone,
    password // Hashed password from previous middleware
  } = req.body;

  // Validate required fields
  const requiredFields = { FAN, image, email, name, phone, password };
  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      code: 'MISSING_REQUIRED_FIELDS',
      missingFields
    });
  }

  try {
    // Check for existing client
    const existingClient = await Client.findOne({
      $or: [{ email }, { phoneNumber: phone }, { FAN }]
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Developer already registered',
        code: 'DEVELOPER_EXISTS',
        existingFields: {
          email: !!existingClient.email,
          phone: !!existingClient.phoneNumber,
          FAN: !!existingClient.FAN
        }
      });
    }

    // Process name components
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
    const lastName = nameParts.length > 1 ? nameParts.slice(-1)[0] : '';

    // Create new developer client
    const secretKey = generateRandomSecretKey(32); 
    const newClient = new Client({
      fan: FAN,
      photo: image,
      name,
      email,
      organizationName,
      systemDescription,
      callbackURL,
      firstName,
      middleName,
      lastName,
      phoneNumber: phone,
      secretKey,
      password,
      region,
      dateOfBirth: dob,
      zone,
      gender,
      woreda,
      nationality, 
      tier: process.env.DEFAULT_TIER || 'free',
      isVerified: false
    });

    await newClient.save();

    // Generate and save API key
    const apiKey = generateRandomSecretKey(32);
    const newApiKey = new ApiKey({
      key: apiKey,
      client: newClient._id,
      name: `${name}'s Primary Key`,
      rateLimit: parseInt(process.env.DEFAULT_RATE_LIMIT) || 500,
      expiresAt: new Date(Date.now() + (parseInt(process.env.API_KEY_EXPIRY_DAYS) || 365) * 86400000),
      ipRestrictions: req.ip ? [req.ip] : [],
      permissions: {
        sendOtp: true,
        verifyOtp: true,
        userInfo: true
      }
    });

    await newApiKey.save();

    // Send welcome email with API key
    // Compose email content
    const subject = 'Welcome to Fayda Developer Portal';
    const text = `Hello ${name},

    Welcome to the Fayda Developer Portal! 🎉

    Here is your API access information:
    - Client ID: ${newClient._id}
    - API Key: ${apiKey}

    Please store this information securely. You will only see the API key once.

    Best regards,
    The Fayda Integration Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Welcome to Fayda Developer Portal 🎉</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering as a developer. Below is your access information:</p>
        <ul>
          <li><strong>Client ID:</strong> ${newClient._id}</li>
          <li><strong>API Key:</strong> ${apiKey}</li>
          <li><strong>Secret Key:</strong> ${secretKey}</li>
        </ul>
        <p><strong>⚠️ Note:</strong> This secretKey key will not be shown again. Please store it securely.</p>
        <p><strong>⚠️ Note:</strong> The API key will expire at: ${newApiKey.expiresAt} </p>
        <br>
        <p>Best regards,<br>The Fayda Integration Team</p>
      </div>
    `;

    // Send email
    await sendEmail(email, subject, text, html);

    return res.status(201).json({
      success: true,
      message: 'Developer registered successfully',
      code: 'DEVELOPER_REGISTERED', 
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors
      });
    }
    console.error('Developer Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register developer',
      code: 'REGISTRATION_FAILED'
    });
  }
}

async function handleEndUserRegistration(req, res) {
  const { Client, ApiKey, FaydaUserData } = getModels();
  const {
    FAN,
    image,
    email,
    password,
    name,
    region,
    dob,
    zone,
    gender,
    woreda,
    nationality,
    phone,
    security,
    clientId
  } = req.body;

  const apiKeyUsed = getApiKey(req, res);
  if (!apiKeyUsed) {
    return res.status(401).json({
      success: false,
      message: 'API key required',
      code: 'API_KEY_REQUIRED'
    });
  }

  // Validate required fields
  const requiredFields = { FAN, image, email, name, phone, password };
  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      code: 'MISSING_REQUIRED_FIELDS',
      missingFields
    });
  }

  try {
    // Verify API key
    const apiKeyRecord = await ApiKey.findOne({
      key: apiKeyUsed,
      isActive: true
    }).populate('client');

    if (!apiKeyRecord) {
      return res.status(403).json({
        success: false,
        message: 'Invalid API key',
        code: 'INVALID_API_KEY'
      });
    }

    if (apiKeyRecord.isExpired) {
      return res.status(403).json({
        success: false,
        message: 'API key has expired',
        code: 'API_KEY_EXPIRED'
      });
    }
 
    // Process name components
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
    const lastName = nameParts.length > 1 ? nameParts.slice(-1)[0] : '';

    console.log('Password being saved:', password);
    // Create user data record
    const newUserData = new FaydaUserData({
      clientId: apiKeyRecord.client._id,
      apiKeyUsed: apiKeyRecord.key,
      fan: FAN,
      photo: image,
      name,
      email,
      password,
      firstName,
      middleName,
      lastName,
      region,
      dateOfBirth: dob,
      zone,
      gender,
      woreda,
      nationality,
      phoneNumber: phone,
      security: {
        ...security,
        registeredIp: req.ip
      },
      metadata: {
        registeredVia: 'API',
        registrationClient: clientId,
        apiKeyId: apiKeyRecord._id
      },
      verificationStatus: 'pending'
    });
    await newUserData.save();

    // Update API key usage stats
    apiKeyRecord.usageCount += 1;
    apiKeyRecord.lastUsed = new Date();
    await apiKeyRecord.save();

    
    // fire‐and‐forget callback
    sendToDeveloperCallback(apiKeyRecord.client._id, newUserData)
    .catch(err => console.error('Unexpected error in callbackToDeveloper:', err));
    

    res.status(201).json({
      success: true,
      message: 'User data stored successfully',
      code: 'USER_DATA_STORED',
      data: { 
        userId: newUserData._id,
        FAN: newUserData.fan,
        name: `${firstName} ${middleName}`.trim(), 
      }
    });
 

  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      console.log('Validation Errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors
      });
    }
    console.error('End User Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
      code: 'REGISTRATION_FAILED'
    });
  }
}