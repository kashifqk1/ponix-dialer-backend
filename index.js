const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/token', async (req, res) => {
  try {
    const response = await fetch(
      `https://${process.env.SIGNALWIRE_SPACE_URL}/api/relay/rest/jwt`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            process.env.SIGNALWIRE_PROJECT_ID + ':' + process.env.SIGNALWIRE_API_TOKEN
          ).toString('base64'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expires_in: 3600,
          resource: 'ponix_dialer'
        })
      }
    );
    const data = await response.json();
    res.json({ token: data.jwt_token });
  } catch (err) {
    console.error('Token error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/voice', (req, res) => {
  const to = req.body.To;
  const callerId = process.env.CALLER_ID;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${callerId}">
    <Number>${to}</Number>
  </Dial>
</Response>`;
  res.type('text/xml');
  res.send(xml);
});

app.get('/', (req, res) => res.send('Ponix Dialer Backend Running - SignalWire'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
