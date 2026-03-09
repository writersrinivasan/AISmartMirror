'use client';

import { CloudRain, Sun, Cloud, Snowflake } from 'lucide-react';

interface WeatherWidgetProps {
    data: {
        temp: number;
        condition: string;
    };
}

export default function WeatherWidget({ data }: WeatherWidgetProps) {
    if (!data) return null;

    const renderIcon = () => {
        const condition = data.condition.toLowerCase();
        if (condition.includes('sun') || condition.includes('clear')) return <Sun className="w-12 h-12 text-yellow-100" />;
        if (condition.includes('rain')) return <CloudRain className="w-12 h-12 text-blue-200" />;
        if (condition.includes('snow')) return <Snowflake className="w-12 h-12 text-blue-100" />;
        return <Cloud className="w-12 h-12 text-gray-300" />;
    };

    return (
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-3xl border border-white/10 transition-all duration-700 ease-in-out">
            <div className="drop-shadow-lg">
                {renderIcon()}
            </div>
            <div className="flex flex-col">
                <span className="text-4xl font-light">{data.temp}°</span>
                <span className="text-lg text-gray-400 capitalize">{data.condition}</span>
            </div>
        </div>
    );
}
