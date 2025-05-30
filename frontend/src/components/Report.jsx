import React, { useState } from 'react';
import axios from 'axios';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

const Report = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');

  const handleFetchReport = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/expense/report', {
        headers: { 'x-auth-token': localStorage.getItem('token') },
        params: { month, year },
      });
      setReport(res.data.report);
      setExpenses(res.data.expenses);
      setError('');
    } catch (err) {
       console.error(err);
      setError('Failed to fetch report');
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/expense/report/export', {
        headers: { 'x-auth-token': localStorage.getItem('token') },
        params: { month, year },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${month}-${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
       console.error(err);
      setError('Failed to export report');
    }
  };

  const pieChartData = {
    labels: Object.keys(report),
    datasets: [
      {
        label: 'Category Spending',
        data: Object.values(report),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF',
          '#FF6B6B',
          '#4CAF50',
        ],
      },
    ],
  };

  const lineChartData = {
    labels: expenses.map((exp) => new Date(exp.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Spending Over Time',
        data: expenses.map((exp) => exp.amount),
        borderColor: '#36A2EB',
        fill: false,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Monthly Report</h2>
      <div className="flex mb-4">
        <input
          type="number"
          placeholder="Month (1-12)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-1/2 p-2 mr-2 border rounded"
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-1/2 p-2 border rounded"
        />
      </div>
      <button onClick={handleFetchReport} className="w-full bg-blue-600 text-white p-2 rounded mb-4">
        Generate Report
      </button>
      <button onClick={handleExportPDF} className="w-full bg-purple-600 text-white p-2 rounded mb-4">
        Export as PDF
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {Object.keys(report).length > 0 ? (
        <div>
          <ul className="mb-4">
            {Object.entries(report).map(([category, amount]) => (
              <li key={category} className="mb-2">
                <strong>{category}:</strong> ₹{amount}
              </li>
            ))}
          </ul>
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Category Distribution</h3>
            <Pie data={pieChartData} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Spending Trend</h3>
            <Line data={lineChartData} />
          </div>
        </div>
      ) : (
        <p>No report data</p>
      )}
    </div>
  );
};

export default Report;
