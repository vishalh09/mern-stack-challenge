const express = require('express');
const router = express.Router();
const axios = require('axios');
const Transaction = require('../models/Transaction');


router.get('/initialize', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;
    
    // Clear existing data
    await Transaction.deleteMany({});
    
    // Insert new data
    await Transaction.insertMany(transactions);
    
    res.status(200).send('Database initialized with seed data');
  } catch (error) {
    res.status(500).send('Error initializing database');
  }
});

module.exports = router;
