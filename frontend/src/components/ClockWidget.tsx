'use client';

import { useState, useEffect } from 'react';

export default function ClockWidget() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!time) return null;

    const hours = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const date = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="flex flex-col items-end opacity-80 text-right">
            <div className="text-6xl font-light tracking-wider drop-shadow-md">
                {hours}
            </div>
            <div className="text-xl font-medium tracking-wide mt-1 text-gray-300 drop-shadow-sm">
                {date}
            </div>
        </div>
    );
}
