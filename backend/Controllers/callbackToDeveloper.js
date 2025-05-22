import jwt from 'jsonwebtoken';
import axios from 'axios';
import { getModels } from '../models/index.js';
import { sendEmail } from '../Controllers/emailService.js'; 

/**
 * sendToDeveloperCallback
 * -----------------------
 * Load the developer’s record (to get secretKey & callbackURL), build a JWT over
 * the newUserData, then POST it to their callbackURL with X-Client-Id header.
 *
 * @param {ObjectId|string} clientId    The Mongo _id of the developer client
 * @param {Document}        newUserData The saved FaydaUserData mongoose document
 */
export async function sendToDeveloperCallback(clientId, newUserData) {
  const { Client } = getModels();

  // 1) load developer record
  const developer = await Client.findById(clientId).select('+secretKey +callbackURL');
  if (!developer || !developer.callbackURL || !developer.secretKey) {
    console.warn(`⚠️  No callback configured for client ${clientId}`);
    return;
  }

  // 2) build the payload
  const payload = {
    clientId: clientId.toString(),
    userId: newUserData._id.toString(), 
    fan: newUserData.fan,
    photo: newUserData.photo,
    name: newUserData.name,
    email: newUserData.email,
    password: newUserData.password,
    firstName: newUserData.firstName,
    middleName: newUserData.middleName,
    lastName: newUserData.lastName,
    region: newUserData.region,
    dateOfBirth: newUserData.dateOfBirth,
    zone: newUserData.zone,
    gender: newUserData.gender,
    woreda: newUserData.woreda,
    nationality: newUserData.nationality,
    phoneNumber: newUserData.phoneNumber,
    security: newUserData.security,
    metadata: newUserData.metadata,
    verificationStatus: 'Email verification will be initiated soon'
  };

  // 3) sign JWT
  const token = jwt.sign(payload, developer.secretKey, { algorithm: 'HS256', expiresIn: '5m' });

  const headers = {
    'Content-Type': 'application/json',
    'X-Client-Id': clientId.toString()
  };

  // 4) deliver with retries
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await axios.post(developer.callbackURL, { token }, { headers, timeout: 5000 });
      console.log(`✅ Callback delivered to ${developer.callbackURL} (attempt ${attempt})`);
      return;
    } catch (err) {
      console.warn(`⚠️  Callback attempt ${attempt} failed for client ${clientId}: ${err.message}`);
      if (attempt === maxAttempts) {
        try {
          // Compose and send error email
          const subject = 'Callback Delivery Failed';
          const text = `Hello ${developer.name},\n\nWe attempted to send a callback to your URL ${developer.callbackURL} but it failed after ${maxAttempts} attempts.\n\nPlease check your server logs.\n\nBest regards,\nThe MyFayda Team`;
          
          const html = `
            <div style="font-family: Arial, sans-serif;">
              <h2>Callback Delivery Failed</h2>
              <p>Hello <strong>${developer.name}</strong>,</p>
              <p>We attempted to send a callback to your URL <code>${developer.callbackURL}</code> but it failed after ${maxAttempts} attempts.</p>
              <p>Please check your server's availability and endpoint configuration.</p>
              <p>Best regards,<br>The MyFayda Integration Team</p>
            </div>
          `;

          await sendEmail(developer.email, subject, text, html);
          console.log(`📧 Failure notification sent to ${developer.email}`);
        } catch (emailErr) {
          console.error('❌ Failed to send failure email:', emailErr.message);
        }
      }
      if (attempt < maxAttempts) await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}
