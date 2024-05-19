const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const port = 3000;

let airQualityValue = 0; 

app.use(bodyParser.json());
app.use(cors());

app.post('/api/airquality', (req, res) => {
  const { airQuality } = req.body;
  airQualityValue = airQuality;
  res.json({ message: 'Air quality updated successfully' });
});

app.get('/api/airquality', (req, res) => {
  res.json({ airQuality: airQualityValue });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
