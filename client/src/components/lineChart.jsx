import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const LineChart = () => {
    const chartRef = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);
    const [data, setData] = useState([]);

    const generateRandomData = () => {
        // Generate random data for 12 months
        return Array.from({ length: 12 }, () => Math.floor(Math.random() * 200));
    };

    const handleYearChange = (event) => {
        const selectedYear = event.target.value;
        // Generate new random data when year changes
        setData(generateRandomData());
    };

    useEffect(() => {
        // Set initial data to a random dataset
        const initialData = generateRandomData();
        setData(initialData);

        const ctx = chartRef.current.getContext('2d');

        const newChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Monthly Data',
                    data: initialData,
                    borderColor: '#00a272',
                    backgroundColor: 'rgba(0, 162, 114, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    tooltip: { mode: 'index' }
                },
                scales: {
                    x: { title: { display: true, text: 'Months' } },
                    y: { title: { display: true, text: 'Values' }, beginAtZero: true }
                }
            }
        });

        setChartInstance(newChart);

        return () => {
            // Destroy the chart instance when the component unmounts or before creating a new chart
            if (newChart) {
                newChart.destroy();
            }
        };
    }, []); // Empty dependency array ensures this runs once on mount

    useEffect(() => {
        if (chartInstance) {
            chartInstance.data.datasets[0].data = data;
            chartInstance.update();
        }
    }, [data, chartInstance]);

    return (
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
            <h2>Monthly Data Overview</h2>
            <label htmlFor="year">Select Year:</label>
            <select id="year" onChange={handleYearChange}>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
            </select>
            <canvas ref={chartRef} />
        </div>
    );
};

export default LineChart;