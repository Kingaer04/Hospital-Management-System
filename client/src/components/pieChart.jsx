import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, DoughnutController } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title, DoughnutController);

const AppointmentSignals = () => {
    const [totalAppointments, setTotalAppointments] = useState(0);
    const [concluded, setConcluded] = useState(0);
    const [canceled, setCanceled] = useState(0);

    useEffect(() => {
        // Generate a random total number of appointments
        const total = Math.floor(Math.random() * 1000); // For demonstration, up to 1000
        const concludedCount = Math.floor(Math.random() * (total + 1)); // Ensure it doesn't exceed total
        const canceledCount = total - concludedCount;

        setTotalAppointments(total);
        setConcluded(concludedCount);
        setCanceled(canceledCount);
    }, []);

    const data = {
        labels: ['Concluded', 'Canceled'],
        datasets: [
            {
                data: [concluded, canceled],
                backgroundColor: ['#00a272', 'lightcoral'],
                hoverOffset: 2,
            },
        ],
    };

    const totalPercentage = totalAppointments > 0 
        ? ((concluded / totalAppointments) * 100).toFixed(2) 
        : 0;

    const options = {
        plugins: {
            legend: {
                display: false,
                position: 'bottom'
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const percentage = ((tooltipItem.raw / totalAppointments) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${percentage}%`;
                    },
                },
            },
            datalabels: {
                formatter: (value, context) => {
                    const total = context.chart._data.datasets[context.datasetIndex].data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(2);
                    return `${percentage}%`;
                },
                color: 'white',
                anchor: 'center',
                align: 'center',
            },
        },
    };

    return (
        <div style={{ borderColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', width: '300px' }}>
            <div className='text-[20px] font-semibold p-4'>
                <h2 className='font-semibold'>
                    Appointment Signals
                </h2>
                {totalAppointments}
            </div>
            <div className='h-[4px] bg-[#f9f9f9]'>

            </div>
            <div style={{ width: '100%', height: '250px', padding: '20px' }}>
                <Pie data={data} options={options} />
            </div>
            <div className='flex p-[20px]'>
                <div className='flex items-center'>
                    <span className='mr-1' style={{ color: '#00a272', fontSize: '14px' }}>●</span>
                    <span style={{ fontSize: '12px' }}>Concluded</span>
                </div>
                <div className='flex items-center ml-2'>
                    <span className='mr-1' style={{ color: 'lightcoral', fontSize: '14px' }}>●</span>
                    <span style={{ fontSize: '12px' }}>Canceled</span>
                </div>
            </div>
        </div>
    );
};

export default AppointmentSignals;