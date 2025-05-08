import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import NodeCache from 'node-cache';
import validator from 'validator';
import axios from 'axios';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

function getApiKey(req, res) {
  return req.apiKey?.key || res.locals.apiKey?.key || '';
}

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});



// Enhanced password handling utilities
const PASSWORD_CONFIG = {
  saltRounds: 12, // Industry standard (higher than default 10 for extra security)
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1
};
 
// Secure password hashing
export async function hashPassword(password) {
  return await bcrypt.hash(password, PASSWORD_CONFIG.saltRounds);
}

// Password validation
export function validatePasswordStrength(password) {
  return validator.isStrongPassword(password, {
    minLength: PASSWORD_CONFIG.minLength,
    minLowercase: PASSWORD_CONFIG.minLowercase,
    minUppercase: PASSWORD_CONFIG.minUppercase,
    minNumbers: PASSWORD_CONFIG.minNumbers,
    minSymbols: PASSWORD_CONFIG.minSymbols
  });
}


// Unified session management with TTL (10 minutes)
const sessionCache = new NodeCache({ 
  stdTTL: 600, 
  checkperiod: 120,
  useClones: false
});

// Helper functions
async function closeBrowser(browser) {
  try {
    if (browser?.isConnected()) {
      await browser.close();
    }
  } catch (error) {
    console.error('Error closing browser:', error);
  }
}

/*
async function takeScreenshot(page, prefix = '') {
  const path = `debug-${prefix}-${Date.now()}.png`;
  await page.screenshot({ path });
  return path;
}
*/

// Main controller functions
export const sendOtp = async (req, res) => {
  const { fan, portal, email, organizationName, systemDescription, callbackURL, password } = req.body;

  if (!/^\d{16}$/.test(fan)) {
    return res.status(400).json({ error: 'Invalid FAN. It must be 16 digits.' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: process.env.PROJ_STAT === 'development' ? false : true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1920,1080'
      ],
      defaultViewport: null
    }); 
    const page = await browser.newPage();
    
    // Configure page
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'accept-language': 'en-US,en;q=0.9' });
    page.setDefaultNavigationTimeout(process.env.PUPPETEER_TIMEOUT || 60000);


    // Navigation and form submission
    console.log('Navigating to Fayda...');
    await page.goto('https://card-order.fayda.et/home', {
      waitUntil: 'networkidle2'
    });

    console.log('Filling FAN...');
    await page.waitForSelector('input[name="fcn"]');
    await page.$eval('input[name="fcn"]', el => el.value = '');
    await page.type('input[name="fcn"]', fan, { delay: 50 });

    console.log('Submitting...');
    const [response] = await Promise.all([
      page.waitForResponse(res => 
        res.url().includes('/verify-fan') && res.status() === 200
      ).catch(() => null),
      page.click('button[type="submit"]')
    ]);

    // Determine next step
    console.log('Checking response...');
    const otpScreen = await page.waitForSelector('p.font-semibold.text-xl', { timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    if (!otpScreen) {
      if (await page.$('img[alt="userPicture"]')) {
        const data = await extractDataWithFallback(page);
        await closeBrowser(browser);
        return res.json({ message: 'Direct access', data });
      }
      throw new Error('OTP screen not shown');
    }

    // Store session
    const sessionId = uuidv4();
    sessionCache.set(sessionId, { browser, page, fan, portal, email, organizationName, systemDescription, callbackURL, password });

    return res.json({
      message: 'OTP required',
      sessionId
    });

  } catch (error) {
    await closeBrowser(browser);
    console.error('SendOTP Error:', error);
    return res.status(500).json({
      error: error.message.includes('timeout')
        ? 'Request timed out'
        : error.message
    });
  }
};

export const verifyOtp = async (req, res) => {
  const { sessionId, otp } = req.body;

  if (!sessionId || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'Invalid session ID or OTP' });
  }

  const session = sessionCache.get(sessionId);
  if (!session) {
    return res.status(400).json({ error: 'Session expired' });
  }

  const { browser, page } = session;
  const { portal, email, organizationName, systemDescription, callbackURL, password } = session;

  try {
    // Validate session state
    if (!browser?.isConnected() || page?.isClosed()) {
      sessionCache.del(sessionId);
      await closeBrowser(browser);
      return res.status(400).json({ error: 'Session expired' });
    }

    // OTP entry
    console.log('Entering OTP...');
    //const preScreenshot = await takeScreenshot(page, 'pre-otp');
    
    const otpInputs = await page.$$('input[aria-label^="Please enter OTP character"]');
    if (otpInputs.length !== 6) {
      //throw new Error(`Found ${otpInputs.length} OTP fields`);
      return res.status(400).json({ 
        error: 'Invalid FAN number',
        code: 'INVALID_FAN',
        details: 'The provided FAN number could not be verified'
      });
    }

    for (let i = 0; i < 6; i++) {
      await otpInputs[i].focus();
      await otpInputs[i].type(otp[i], { delay: 100 });
    }

    // Submit OTP with more flexible waiting
    console.log('Submitting OTP...');
    //const postScreenshot = await takeScreenshot(page, 'post-otp');

    // First try - standard navigation wait
    try {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
        page.click('button[type="submit"]')
      ]);
    } catch (navError) {
      console.log('Standard navigation wait failed, trying fallback...');
      if (!await page.$('img[alt="userPicture"]')) {
        await Promise.all([
          page.waitForResponse(response => response.status() === 200, { timeout: 30000 }),
          page.click('button[type="submit"]')
        ]).catch(() => {});
      }
    }

    // Verify we're on the result page
    try {
      await page.waitForSelector('img[alt="userPicture"]', { timeout: 30000 });
    } catch (error) {
      if (!await page.$('img[alt="userPicture"]')) {
        throw new Error('Failed to reach result page after OTP submission');
      }
    }

    // Extract data with more robust error handling
    let extracted;
    try {
      extracted = await extractDataWithFallback(page);
    } catch (extractError) {
      console.error('Data extraction error:', extractError);
      const allSpans = await page.evaluate(() => 
        Array.from(document.querySelectorAll('span')).map(span => span.textContent.trim())
      );
      console.log('All span contents:', allSpans);
      throw new Error('Failed to extract required fields');
    }

    // Cleanup
    sessionCache.del(sessionId);
    await closeBrowser(browser);

     // Call userInfo logic directly:
      req.body = { portal, email, organizationName, systemDescription, callbackURL, password, fan: session.fan, ...extracted };
      return userInfo(req, res);

  } catch (error) {
    //const errorScreenshot = await takeScreenshot(page, 'error');
    sessionCache.del(sessionId);
    await closeBrowser(browser);
    
    console.error('VerifyOTP Error:', error);
    return res.status(500).json({
      error: error.message.includes('timeout')
        ? 'OTP verification timed out'
        : `Verification failed: ${error.message}`,
      //debug: errorScreenshot
    });
  }
};

// Enhanced data extraction with fallback
async function extractDataWithFallback(page) {
  await page.waitForSelector('img[alt="userPicture"]', { timeout: 10000 });

  const data = await page.evaluate(() => {
    const allSpans = Array.from(document.querySelectorAll('span'))
      .map(el => el.textContent.trim());
      
    return {
      image: document.querySelector('img[alt="userPicture"]')?.src || '',
      FAN: document.querySelector('input[name="fcn"]')?.value || allSpans[2] || '',
      name: allSpans[8] || '',
      region: allSpans[12] || '',
      dob: allSpans[16] || '',
      zone: allSpans[20] || '',
      sex: allSpans[24] || '',
      woreda: allSpans[28] || '',
      nationality: allSpans[32] || '',
      phone: allSpans[33] || ''
    };
  });

  if (!data.FAN || !data.name) {
    throw new Error('Essential fields missing in extracted data');
  }

  return data;
 
}


export const userInfo = async (req, res) => {
  const { portal, email, organizationName, systemDescription, callbackURL, password, fan, ...extractedData } = req.body;

  // Validate required fields
  const requiredFields = ['email', 'password', 'fan', 'name', 'phone'];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({ 
      message: `Missing required fields: ${missingFields.join(', ')}`,
      code: 'MISSING_REQUIRED_FIELDS'
    });
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ 
      message: "Invalid email format",
      code: 'INVALID_EMAIL'
    });
  }

  if(portal == 'developer') {
    // Validate organization name, Check for potentially malicious characters
    if (!organizationName || organizationName.trim().length < 3) {
      return res.status(400).json({
        message: "Organization name must be at least 3 characters",
        code: 'INVALID_ORGANIZATION_NAME'
      });
    }
    if (organizationName.length > 100) {
      return res.status(400).json({
        message: "Organization name cannot exceed 100 characters",
        code: 'ORGANIZATION_NAME_TOO_LONG'
      });
    }
    if (/[<>{}]/.test(organizationName)) {
      return res.status(400).json({
        message: "Organization name contains invalid characters",
        code: 'INVALID_CHARACTERS_IN_NAME'
      });
    }

    // Validate system description
    if (!systemDescription || systemDescription.trim().length < 20) {
      return res.status(400).json({
        message: "System description must be at least 20 characters",
        code: 'DESCRIPTION_TOO_SHORT'
      });
    }
    if (systemDescription.length > 500) {
      return res.status(400).json({
        message: "System description cannot exceed 500 characters",
        code: 'DESCRIPTION_TOO_LONG'
      });
    }
    if (/[<>{}]/.test(systemDescription)) {
      return res.status(400).json({
        message: "System description contains invalid characters",
        code: 'INVALID_CHARACTERS_IN_DESCRIPTION'
      });
    }

    /* Validate callback URL
    if (!validator.isURL(callbackURL)) {
      return res.status(400).json({
        message: "Invalid callback URL",
        code: 'INVALID_CALLBACK_URL'
      });
    }
    */

  }

  // Validate password strength 
  if (!validatePasswordStrength(password)) {
    return res.status(400).json({
      message: `Password must be at least ${PASSWORD_CONFIG.minLength} characters with uppercase, lowercase, number and symbol`,
      code: 'WEAK_PASSWORD',
      requirements: PASSWORD_CONFIG
    });
  }

  try {
    // Hash password before any processing
    let passwordHash;
    try {
      passwordHash = await hashPassword(password);
    } catch (hashError) {
      return res.status(500).json({
        message: 'Password hashing failed',
        code: 'HASHING_ERROR'
      });
    }

    
    let imageUrl = extractedData.image || '';
    if (extractedData.image?.startsWith('data:image')) {
      try {
        imageUrl = await uploadBase64ToCloudinary(extractedData.image, fan);
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
        // Continue with original image data if upload fails
      }
    }

    const organizedData = {
      FAN: fan,
      image: imageUrl,
      email,
      organizationName: organizationName || '', 
      systemDescription: systemDescription || '', 
      callbackURL: callbackURL || '', 
      password: passwordHash, // Send hashed password only
      name: extractedData.name,
      region: extractedData.region || '',
      dob: extractedData.dob || '',
      zone: extractedData.zone || '',
      gender: extractedData.sex || '',
      woreda: extractedData.woreda || '',
      nationality: extractedData.nationality || '',
      phone: extractedData.phone,
      clientId: req.client?._id,
      //apiKeyUsed: req.apiKey,
      security: {
        hashAlgorithm: 'bcrypt',
        saltRounds: PASSWORD_CONFIG.saltRounds,
        hashedAt: new Date().toISOString()
      }
    };

    const response = await axios.post(
      `${process.env.SERVER_SITE_URL}/organizeData`,
      organizedData,
      {
        headers: {
          'x-api-key': getApiKey(req, res)
        }
      }
    );
    
    
    return res.status(200).json({
      message: 'Data organized and sent successfully',
      responseData: {
        ...response.data,
        sensitiveData: {
          isPasswordHashed: true,
          hashAlgorithm: 'bcrypt'
        }
      }
    });

  } catch (error) {
    console.error('Error in userInfo:', error);
    return res.status(500).json({
      error: error.response?.data?.message || 'Internal server error',
      code: 'PROCESSING_ERROR',
      details: process.env.NODE_ENV === 'development' 
        ? error.message 
        : undefined
    });
  }
};
 

// Helper function for Cloudinary upload
async function uploadBase64ToCloudinary(base64String, fanId) {
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const fileSizeInBytes = (base64String.length * 3) / 4 - (base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0);
  if (fileSizeInBytes > MAX_FILE_SIZE) {
    throw new Error('Base64 string exceeds size limit');
  }

  const result = await cloudinary.v2.uploader.upload(base64String, {
    folder: 'fayda-kyc',
    public_id: `user_${fanId}_${Date.now()}`,
    resource_type: 'image',
    transformation: [
      { width: 300, height: 300, crop: 'fill' },
      { quality: 'auto:good' }
    ]
  });
  return result.secure_url;
} 