const express = require('express');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/token', (req, res) => {
  try {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWIML_APP_SID,
      incomingAllow: false
    });

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity: 'ponix_dialer', ttl: 3600 }
    );

    token.addGrant(voiceGrant);
    res.json({ token: token.toJwt() });
  } catch (err) {
    console.error('Token error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/voice', (req, res) => {
  try {
    const twiml = new twilio.twiml.VoiceResponse();
    const dial = twiml.dial({ callerId: process.env.CALLER_ID });
    dial.number(req.body.To);
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (err) {
    console.error('Voice error:', err);
    res.status(500).send('Error');
  }
});

app.get('/', (req, res) => {
  res.send('Ponix Dialer Backend Running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
