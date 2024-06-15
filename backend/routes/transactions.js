const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Helper function to parse month name
const getMonthNumber = (monthName) => {
  const date = new Date(Date.parse(monthName + " 1, 2012"));
  return date.getMonth() + 1;
};

router.get('/transactions', async (req, res) => {
  const { month, search, page = 1, perPage = 10 } = req.query;
  const monthNumber = getMonthNumber(month);

  const query = {
    dateOfSale: { $month: monthNumber },
  };

  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { price: new RegExp(search, 'i') }
    ];
  }

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    res.json(transactions);
  } catch (error) {
    res.status(500).send('Error fetching transactions');
  }
});

module.exports = router;
