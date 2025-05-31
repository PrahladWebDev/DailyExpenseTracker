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
        borderColor: '#ffffff',
        borderWidth: 2,
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
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#36A2EB',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 max-w-md w-full mx-auto md:mx-0">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Monthly Report</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Month (1-12)</label>
          <input
            id="month"
            type="number"
            placeholder="Enter month (1-12)"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input
            id="year"
            type="number"
            placeholder="Enter year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          />
        </div>
      </div>
      <button
        onClick={handleFetchReport}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium mb-4"
      >
        Generate Report
      </button>
      <button
        onClick={handleExportPDF}
        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium mb-4"
      >
        Export as PDF
      </button>
      {Object.keys(report).length > 0 ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Category Breakdown</h3>
            <ul className="space-y-2">
              {Object.entries(report).map(([category, amount]) => (
                <li key={category} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <span className="text-gray-700">{category}</span>
                  <span className="font-bold text-green-600">₹{amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Category Distribution</h3>
            <div className="relative h-64">
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Spending Trend</h3>
            <div className="relative h-64">
              <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No report data</p>
      )}
    </div>
  );
};

export default Report;
