import { useState, useEffect } from 'react';

export const useTasks = () => {
    const [stats, setStats] = useState({
        load: 0,
        priced: 0,
        submitted: 0,
        reviewed: 0,
        accepted: 0,
        rejected: 0,
        trust: 0
    });

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/tasks/stats');
            const data = await res.json();
            if (!res.ok) return;
            setStats(data);
        } catch {
            console.log("Fallback dummy data");
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);
    return { stats };
};