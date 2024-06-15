const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/transactions', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


const initializeRoute = require('./routes/initialize');
const transactionsRoute = require('./routes/transactions');


app.use('/api', initializeRoute);
app.use('/api', transactionsRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

