import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import Card from './Card';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement
);

function AnalyticsView() {
  const data = {
    labels: ['Retailers', 'Customers', 'Active Today', 'Locations'],
    datasets: [{
      label: 'Count',
      data: [12, 24, 18, 6],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    }]
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Dashboard Analytics' } }
  };

  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Bar data={data} options={options} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <Pie data={data} options={options} />
      </div>
      <div>
        <Line data={data} options={options} />
      </div>
    </Card>
  );
}

export default AnalyticsView;
