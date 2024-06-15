import React, { useState } from 'react';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import PieChartComponent from './components/PieChart'
import BarChartComponent from './components/BarChart';

const App = () => {
  const [month, setMonth] = useState('March');

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  return (
    <div>
      <h1>Transaction Dashboard</h1>
      <label htmlFor="month">Select Month: </label>
      <select id="month" value={month} onChange={handleMonthChange}>
        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      
      <Statistics month={month} />
      <TransactionsTable month={month} />
      <BarChartComponent month={month} />
      <PieChartComponent month={month} />
    </div>
  );
};

export default App;
