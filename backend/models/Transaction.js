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
    $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
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

router.get('/statistics', async (req, res) => {
  const { month } = req.query;
  const monthNumber = getMonthNumber(month);

  try {
    const totalSaleAmount = await Transaction.aggregate([
      { $match: { $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const totalSoldItems = await Transaction.countDocuments({ $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] }, sold: true });
    const totalNotSoldItems = await Transaction.countDocuments({ $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] }, sold: false });

    res.json({
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems,
      totalNotSoldItems
    });
  } catch (error) {
    res.status(500).send('Error fetching statistics');
  }
});

router.get('/barchart', async (req, res) => {
  const { month } = req.query;
  const monthNumber = getMonthNumber(month);

  const priceRanges = [
    { range: '0-100', min: 0, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201-300', min: 201, max: 300 },
    { range: '301-400', min: 301, max: 400 },
    { range: '401-500', min: 401, max: 500 },
    { range: '501-600', min: 501, max: 600 },
    { range: '601-700', min: 601, max: 700 },
    { range: '701-800', min: 701, max: 800 },
    { range: '801-900', min: 801, max: 900 },
    { range: '901-above', min: 901, max: Infinity }
  ];

  try {
    const results = await Promise.all(priceRanges.map(async range => {
      const count = await Transaction.countDocuments({
        $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
        price: { $gte: range.min, $lt: range.max }
      });
      return { range: range.range, count };
    }));

    res.json(results);
  } catch (error) {
    res.status(500).send('Error fetching bar chart data');
  }
});

router.get('/piechart', async (req, res) => {
  const { month } = req.query;
  const monthNumber = getMonthNumber(month);

  try {
    const results = await Transaction.aggregate([
      { $match: { $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json(results.map(result => ({
      category: result._id,
      count: result.count
    })));
  } catch (error) {
    res.status(500).send('Error fetching pie chart data');
  }
});

router.get('/combined', async (req, res) => {
  const { month } = req.query;

  try {
    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      axios.get(`http://localhost:5000/api/transactions?month=${month}`),
      axios.get(`http://localhost:5000/api/statistics?month=${month}`),
      axios.get(`http://localhost:5000/api/barchart?month=${month}`),
      axios.get(`http://localhost:5000/api/piechart?month=${month}`)
    ]);

    res.json({
      transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data
    });
  } catch (error) {
    res.status(500).send('Error fetching combined data');
  }
});

module.exports = router;
