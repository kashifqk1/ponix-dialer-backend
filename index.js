const express = require('express');
const twilio = require('twilio');
const app = express();

app.use(express.urlencoded({ extended: false }));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const twimlAppSid = process.env.TWIML_APP_SID;

// Generate access token for browser calling
app.get('/token', (req, res) => {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twimlAppSid,
    incomingAllow: false,
  });

  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity: 'ponix_dialer'
  });
  token.addGrant(voiceGrant);

  res.json({ token: token.toJwt() });
});

// Handle outbound call
app.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const dial = twiml.dial({ callerId: process.env.CALLER_ID });
  dial.number(req.body.To);
  res.type('text/xml');
  res.send(twiml.toString());
});

app.get('/', (req, res) => res.send('Ponix Dialer Backend Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
