// callbackListener.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken'; 


const app = express();
app.use(express.json());

const registeredClients = {
  "68179c2ea9bd7e43b97608f4": "3704f48dd839be71ca06e7446f7ec126d3424375c99ab3745a1092f820beea2a",
};

app.post('/callback', (req, res) => {
  const clientId = req.headers['x-client-id'];
  const token    = req.body.token;

  if (!clientId || !token) {
    return res.status(400).send('Missing X-Client-Id header or token');
  }

  const secret = registeredClients[clientId];
  if (!secret) {
    return res.status(403).send('Unknown clientId');
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    // log to file
    const ts = new Date().toISOString().replace(/:/g,'-');
    const dir = path.join(process.cwd(), 'logs');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, `callback-${ts}.json`),
      JSON.stringify({ receivedAt: new Date(), clientId, payload }, null, 2)
    );
    console.log(`✅ Callback logged for client ${clientId}`);
    res.send('Callback accepted');
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    res.status(401).send('Invalid token');
  }
});

app.listen(5005, () => console.log('🔐 Callback listener up on port 5005'));

/*

const payload = {
  clientId: '68179c2ea9bd7e43b97608f4',
  userId: 'demoUserId001',
  fan: '1234567890123',
  name: 'JWT Test User',
  email: 'test@demo.com',
  phoneNumber: '+251912345678'
};

const secret1 = '3704f48dd839be71ca06e7446f7ec126d3424375c99ab3745a1092f820beea2a';
const token1 = jwt.sign(payload, secret1, { algorithm: 'HS256', expiresIn: '5m' });

console.log(token1);
*/