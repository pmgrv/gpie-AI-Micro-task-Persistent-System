import React from 'react';

const ChakraDashboard = ({ stats = {} }) => {
    // Utility to draw the segments
    const drawSlices = (radius, count, color) => {
        const safeCount = Math.min(Math.max(count, 0), 365);
        const slices = [];
        const totalDays = 365;
        for (let i = 0; i < totalDays; i++) {
            const angle = (i * 360) / 365;
            const x = 250 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 250 + radius * Math.sin((angle * Math.PI) / 180);
            slices.push(
                <circle 
                    key={i} 
                    cx={x} cy={y} r="2" 
                    fill={i < safeCount ? color : '#d1d9e6'} 
                />
            );
        }
        return slices;
    };

    return (
        <div className="chakra-container">
            <svg width="500" height="500" viewBox="0 0 500 500">
                {/* 1st Outer Circle: LOAD (AI) */}
                {drawSlices(220, stats.load || 0, '#3498db')}
                {/* Sponsored */}
                {drawSlices(200, stats.priced || 0, '#9b59b6')}
                {/* Worked */}
                {drawSlices(160, stats.submitted || 0, '#e67e22')}
                {/* Inner-most Circle: ACCEPTED/EARNED */}
                {drawSlices(100, stats.accepted || 0, '#2ecc71')}
                {/* Rejected Layer */}
                {drawSlices(130, stats.rejected || 0, '#e74c3c')}
                <text x="250" y="255" textAnchor="middle" fontSize="12" fill="#333">
                    TRUST: {stats.trust ?? 0}%
                </text>
            </svg>
            <div className="legend">
                <p>🔵 AI Load | 🟣 Sponsored  | 🟠 Worked | 🟢 Earned | 🔴 Rejected</p>
            </div>
        </div>
    );
};

export default ChakraDashboard;
