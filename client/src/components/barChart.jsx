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
                            backgroundColor: '#00a272',
                            borderRadius: 10, // Set border radius
                            barPercentage: 0.4,
                            categoryPercentage: 0.5,
                        },
                        {
                            label: 'In Treatment', // Uncommented label for clarity
                            data: data.inTreatment,
                            backgroundColor: '#6abce2',
                            borderRadius: 10, // Set border radius
                            barPercentage: 0.4,
                            categoryPercentage: 0.5,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
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
        <div className='p-4 bg-[#fff] rounded-lg shadow-lg'>
            <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center'>
                    <h2 className='mr-1 text-sm'>Hospital Survey</h2>
                    <div className='flex items-center'>
                        <span className='mr-1' style={{ color: '#00a272', fontSize: '14px' }}>●</span>
                        <span style={{ fontSize: '12px' }}>Discharged</span>
                    </div>
                    <div className='flex items-center ml-2'>
                        <span className='mr-1' style={{ color: '#6abce2', fontSize: '14px' }}>●</span>
                        <span style={{ fontSize: '12px' }}>In Treatment</span>
                    </div>
                </div>
                <div className='border border-gray-300 p-1 rounded-lg'>
                    <select id="year" onChange={handleYearChange} className='text-sm'>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                </div>
            </div>
            <canvas ref={chartRef} />
        </div>
    );
};

export default BarChart;