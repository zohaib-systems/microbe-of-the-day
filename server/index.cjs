const express = require('express');
const cors = require('cors');
const { microbes, microbeOfDay } = require('./data.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/api/microbes', (req, res) => {
  res.json(microbes);
});

app.get('/api/microbes/today', (req, res) => {
  console.log('Request received for microbe of the day');
  res.json(microbeOfDay);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});