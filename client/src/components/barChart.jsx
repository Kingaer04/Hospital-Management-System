import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const BarChart = () => {
    const chartRef = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);
    const [data, setData] = useState({ discharged: [], inTreatment: [] });

    const generateRandomData = () => {
        return {
            discharged: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
            inTreatment: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100))
        };
    };

    const handleYearChange = (event) => {
        // Generate new random data when year changes
        setData(generateRandomData());
    };

    useEffect(() => {
        // Set initial data to random dataset
        const initialData = generateRandomData();
        setData(initialData);
    }, []);

    useEffect(() => {
        // Ensure the canvas is fully rendered before creating the chart
        const ctx = chartRef.current ? chartRef.current.getContext('2d') : null;

        if (ctx) {
            const newChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                        {
                            label: 'Discharged',
                            data: data.discharged,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            barPercentage: 0.4,
                            categoryPercentage: 0.5,
                        },
                        {
                            label: 'In Treatment',
                            data: data.inTreatment,
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            barPercentage: 0.4,
                            categoryPercentage: 0.5,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: true },
                        tooltip: { mode: 'index' }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Months' },
                            stacked: false,
                        },
                        y: {
                            title: { display: true, text: 'Number of Patients' },
                            beginAtZero: true,
                            stacked: false,
                        }
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
        }
    }, [data]); // Recreate chart whenever data changes

    return (
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
            <h2>Hospital Survey Data Overview</h2>
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

export default BarChart;