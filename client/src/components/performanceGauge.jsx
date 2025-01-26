import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const PerformanceGauge = () => {
    const chartRef = useRef(null);
    const [performance, setPerformance] = useState(0);

    const generateRandomData = () => {
        return Math.floor(Math.random() * 600); // Random number between 0 and 600
    };

    useEffect(() => {
        const initialData = generateRandomData();
        setPerformance(initialData);
    }, []);

    // Calculate percentage
    const maxPerformance = 600; // Maximum value (600)
    const percentage = Math.min((performance / maxPerformance) * 100, 100); // Calculate percentage

    // Determine color based on percentage
    let color;
    if (percentage <= 44) {
        color = '#e74c3c'; // Bad (Red)
    } else if (percentage <= 74) {
        color = '#f1c40f'; // Good (Yellow)
    } else {
        color = '#2ecc71'; // Excellent (Green)
    }

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        // Create the gauge chart
        const gaugeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Performance', 'Remaining'],
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [color, '#ddd'],
                    borderWidth: 0, // Remove border
                }]
            },
            options: {
                cutout: '70%', // Create a gauge effect
                responsive: true,
                maintainAspectRatio: false, // Allow custom height
                plugins: {
                    tooltip: {
                        enabled: false, // Disable tooltips
                    },
                    legend: {
                        display: false, // Hide the legend
                    }
                }
            }
        });

        return () => {
            // Destroy the chart instance on unmount
            gaugeChart.destroy();
        };
    }, [percentage, color]); // Update chart when percentage or color changes

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            width: '300px', // Maintain width
            fontFamily: 'Arial, sans-serif',
        }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#333' }}>Monthly Performance</h2>
            <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                <canvas ref={chartRef} style={{ position: 'absolute' }} />
            </div>
            <div style={{ marginTop: '20px', fontSize: '24px', fontWeight: 'bold', color: color }}>
                {percentage.toFixed(2)}%
            </div>
        </div>
    );
};

export default PerformanceGauge;