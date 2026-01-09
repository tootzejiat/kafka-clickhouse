import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';
import { HourlyActivityData } from '../types';

const HourlyActivityChart = ({ data }: { data: HourlyActivityData[] | undefined }) => {
    return (
        <div className='chart-container'>
            <AreaChart
                style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
                responsive
                data={data}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis width="auto" />
                <Tooltip />
                <Area type="monotone" dataKey="avg_ratio_per_hour" stroke="#8884d8" fill="#8884d8" />
                <RechartsDevtools />
            </AreaChart>
        </div>
    );
};

export default HourlyActivityChart;
