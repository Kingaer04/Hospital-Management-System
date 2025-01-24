import React, { useEffect, useState } from 'react';

const GaugeCard = () => {
    const [data, setData] = useState({ today: 0, thisWeek: 0, thisMonth: 0 });

    const generateRandomData = () => {
        return {
            today: Math.floor(Math.random() * 150), // Random number between 0 and 150
            thisWeek: Math.floor(Math.random() * 300), // Random number between 0 and 300
            thisMonth: Math.floor(Math.random() * 600) // Random number between 0 and 600
        };
    };

    useEffect(() => {
        const initialData = generateRandomData();
        setData(initialData);
    }, []);

    // Calculate total and percentage
    const total = data.today + data.thisWeek + data.thisMonth;
    const maxTotal = 1000; // Example maximum value (150 + 300 + 600)
    const percentage = Math.min((total / maxTotal) * 100, 100); // Calculate percentage

    return (
        <div style={{ padding: '10px', borderColor: '#f9f9f9', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', width: '300px' }}>
            <h2 className='mb-7 font-bold text-[12px]'>Patients Report</h2>
            <div className='flex justify-between mb-10 text-[11px]'>
                <div className='flex'>
                    <h3>Today:</h3>
                    <p>{data.today}</p>
                </div>
                <div className='flex'>
                    <h3>This week:</h3>
                    <p>{data.thisWeek}</p>
                </div>
                <div className='flex'>
                    <h3>This Month:</h3>
                    <p>{data.thisMonth}</p>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
                <div style={{ width: '100%', backgroundColor: '#ddd', borderRadius: '5px', overflow: 'hidden', marginRight: '10px' }}>
                    <div style={{ height: '10px', width: `${percentage}%`, backgroundColor: percentage > 100 ? 'red' : '#00a272', transition: 'width 0.5s' }} />
                </div>
                <p style={{ fontSize: '12px', fontWeight: 'bold' }}>{percentage.toFixed(2)}%</p>
            </div>
        </div>
    );
};

export default GaugeCard;