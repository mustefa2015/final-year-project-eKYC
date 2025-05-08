// src/components/CodeEditorPanel.jsx
// src/components/CodeEditorPanel.jsx
import React, { useState } from 'react';

const tabs = ['Embed Code', 'sendOtp', 'verifyOtp', 'Callback'];

const CodeEditorPanel = ({ apiKey, setApiKey, loginUrl, setLoginUrl }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [copySuccess, setCopySuccess] = useState('');
  const [useDemoCredentials, setUseDemoCredentials] = useState(false);

  // Demo credentials from environment variables
  const demoApiKey = import.meta.env.VITE_APP_DEMO_API_KEY;
  const demoLoginUrl = import.meta.env.VITE_APP_CALLRESULT_URL;

  // Toggle between demo and custom credentials
  const toggleDemoCredentials = () => {
    if (useDemoCredentials) {
      setApiKey('');
      setLoginUrl('');
    } else {
      setApiKey(demoApiKey);
      setLoginUrl(demoLoginUrl);
    }
    setUseDemoCredentials(!useDemoCredentials);
  };

  // snippet for embed code
  const embedSnippet = 
`
<a
  href="http://myfayda.railway.app/userportal?apiKey=${apiKey}&login_url=${encodeURIComponent(loginUrl)}"
  className="inline-flex items-center justify-center bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2 font-medium text-sm shadow-sm hover:bg-gray-50"
>
  <img
    src="https://bit.ly/3Z930hV"
    alt="MyFayda Logo"
    className="h-5 w-auto mr-2"
  />
  Sign Up with FaydaID
</a>
`;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopySuccess('Failed to copy');
    }
  };

  return (
    <div className="p-4">
      {/* Tab Headers */}
      <div className="flex border-b mb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px ${
              activeTab===tab ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'Embed Code' && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Integration Setup</h3>
              <p className="text-sm text-gray-600 mb-3">
                Configure your API credentials and generate the embed code for the MyFayda sign-up button.
                This code will redirect users to the Fayda authentication portal.
              </p>
              
              {/* Demo Credentials Toggle */}
              <div className="mb-4 flex items-center">
                <button
                  onClick={toggleDemoCredentials}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    useDemoCredentials ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useDemoCredentials ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Use Demo Credentials
                </span>
                {useDemoCredentials && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Demo Mode Active
                  </span>
                )}
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium">API Key</label>
                <p className="text-xs text-gray-500 mb-1">Your unique identifier for the MyFayda API</p>
                <input
                  className="w-full border px-2 py-1 rounded"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="YOUR_API_KEY"
                  disabled={useDemoCredentials}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Login URL</label>
                <p className="text-xs text-gray-500 mb-1">Where users should be redirected after authentication</p>
                <input
                  className="w-full border px-2 py-1 rounded"
                  value={loginUrl}
                  onChange={e => setLoginUrl(e.target.value)}
                  placeholder="https://yourapp.com/login"
                  disabled={useDemoCredentials}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Embed Snippet</label>
              <p className="text-xs text-gray-500 mb-2">
                Copy this code to your React application to add the Fayda sign-up button.
                Requires react-router-dom's Link component.
              </p>
              <div className="relative">
                <pre className="bg-gray-100 p-3 text-xs rounded overflow-auto">
                  {embedSnippet}
                </pre>
                <button
                  onClick={handleCopyToClipboard}
                  className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                >
                  Copy
                </button>
                {copySuccess && (
                  <div className="absolute bottom-[-20px] left-0 text-green-500 text-xs">
                    {copySuccess}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sendOtp' && (
          <div>
            <h3 className="text-lg font-medium mb-2">OTP Request Endpoint</h3>
            <p className="text-sm text-gray-600 mb-3">
              MyFayda eKYC Uses this endpoint to initiate the OTP (One-Time Password) verification process.
              The system will send an OTP to the user's registered mobile number.
            </p>
            <pre className="bg-gray-100 p-3 text-xs rounded overflow-auto">
{`POST /fayda/sendOtp
Headers:
  Content-Type: application/json
  x-api-key: YOUR_API_KEY

Body:
{
  "portal":"user",
  "fan":"1234567890123456",  // User's Fayda Account Number
  "email":"user@example.com", // User's email address
  "password":"YourPass123!"   // User's password
}

Response:
{
  "message":"OTP required",
  "sessionId":"e1c4a0b9-xxxx-xxxx-xxxx" // Unique session identifier for verification
}`}
            </pre>
          </div>
        )}

        {activeTab === 'verifyOtp' && (
          <div>
            <h3 className="text-lg font-medium mb-2">OTP Verification Endpoint</h3>
            <p className="text-sm text-gray-600 mb-3">
              After receiving the OTP, the user submit it to this endpoint along with the session ID
              to complete the user authentication process.
            </p>
            <pre className="bg-gray-100 p-3 text-xs rounded overflow-auto">
{`POST /fayda/verifyOtp
Headers:
  Content-Type: application/json
  x-api-key: YOUR_API_KEY

Body:
{
  "sessionId":"e1c4a0b9-xxxx-xxxx-xxxx", // From sendOtp response
  "otp":"123456"                         // 6-digit OTP received by user
}

Response:
{
  "success": true,
  "data": {
    "userId": "abcdef123456",            // Unique user identifier
    "fan": "1234567890123456",           // Fayda Account Number
    "email": "user@example.com",         // Verified email
    // ... other user details
  }
}`}
            </pre>
          </div>
        )}

        {activeTab === 'Callback' && (
          <div>
            <h3 className="text-lg font-medium mb-2">Callback Configuration</h3>
            <p className="text-sm text-gray-600 mb-3">
            MyFayda eKYC will POST verification results to your callback URL. Copy and Configure callbackHandler.js  code below to your server to handle the callback. 
            </p>
              
            <p className=" mt-6"></p>
            <pre className="bg-gray-100 p-3 text-xs rounded overflow-auto">
{`
// callbackHandler.js

const express = require('express');
const jwt = require('jsonwebtoken');

// === MongoDB Setup ===
// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/yourdb');
// const User = mongoose.model('User', new mongoose.Schema({ ... }));

// === SQL Setup (PostgreSQL/MySQL) ===
// const { Pool } = require('pg'); // or mysql2
// const db = new Pool({ connectionString: 'postgres://user:pass@localhost/db' });

const app = express();
const PORT = 5005;

app.use(express.json());

const registeredClients = {
  "YOUR_CLIENT_ID": "YOUR_SECRET_KEY", // sample
};

app.post('/callback', async (req, res) => {
  const clientId = req.headers['x-client-id'];
  const token = req.body.token;

  if (!clientId || !token) {
    return res.status(400).send('Missing X-Client-Id header or token');
  }

  const secret = registeredClients[clientId];
  if (!secret) {
    return res.status(403).send('Unknown clientId');
  }

  try {
    const userData = jwt.verify(token, secret, { algorithms: ['HS256'] });

    // === MongoDB Save ===
    // const savedUser = await User.create(userData);

    // === SQL Save (PostgreSQL Example) ===
    // await db.query(
    //   INSERT INTO users (fan, name, email, gender) VALUES ($1, $2, $3, $4),
    //   [userData.fan, userData.name, userData.email, userData.gender]
    // );

    console.log('Verified and saved user:', userData);
    return res.status(200).send('Callback accepted');
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).send('Invalid token');
  }
});
 
`}
            </pre>
            <p className="text-xs text-gray-500 mt-2">
              Note: Always verify the X-Signature header using your shared secret
              to ensure the request originates from MyFayda eKYC .
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditorPanel;