import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend
} from 'recharts';
import { CountryVSGlobalEngagementData } from '../types';

export const CountryVSGlobalChart = ({ data }: { data: CountryVSGlobalEngagementData[] }) => {
    const chartData = [
        { name: 'This Country', ratio: data[0].country_avg },
        { name: 'Global Average', ratio: data![0].global_avg },
    ];

    return (
        <div style={{ width: '100%', maxWidth: '1000px', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                    />
                    <Legend />
                    <Bar dataKey="ratio" radius={[4, 4, 0, 0]} barSize={60}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index === 0 ? '#6366f1' : '#94a3b8'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


