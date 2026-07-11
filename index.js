const express = require('express');
const cors = require('cors');
const { RestClient } = require('@signalwire/compatibility-api');
const { AccessToken } = require('@signalwire/realtime-api');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const projectId = process.env.SIGNALWIRE_PROJECT_ID;
const apiToken = process.env.SIGNALWIRE_API_TOKEN;
const spaceUrl = process.env.SIGNALWIRE_SPACE_URL;
const callerId = process.env.CALLER_ID;

app.get('/token', (req, res) => {
  try {
    const token = new AccessToken({
      project: projectId,
      token: apiToken,
      ttl: 3600,
    });

    token.addResource({
      name: 'ponix_dialer',
      resource: 'calling',
    });

    res.json({ token: token.toJwt() });
  } catch (err) {
    console.error('Token error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/voice', (req, res) => {
  const { VoiceResponse } = require('@signalwire/compatibility-api').twiml;
  const response = new VoiceResponse();
  const dial = response.dial({ callerId: callerId });
  dial.number(req.body.To);
  res.type('text/xml');
  res.send(response.toString());
});

app.get('/', (req, res) => res.send('Ponix Dialer Backend Running - SignalWire'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
