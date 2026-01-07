import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';
import { MonthlyUserData } from '../types';

export default function Chart({ data }: { data: MonthlyUserData[] }) {
    return (
        <LineChart
            style={{ width: '100%', aspectRatio: 1.8, }}
            responsive
            data={data}
        >
            <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
            <XAxis dataKey="date" height={50} label={{ value: 'Month' }} allowDuplicatedCategory={false} />
            <YAxis width={90} label={{ value: 'No of Users', angle: 270 }} />
            <Legend align="right" />
            <Tooltip />

            <Line type="linear" dataKey="inactive" stroke="orange" strokeWidth={2} name="Inactive Users" />
            <Line type="linear" dataKey="banned" stroke="red" strokeWidth={2} name="Banned Users" />
            <Line type="linear" dataKey="active" stroke="green" strokeWidth={2} name="Active Users" />
            <RechartsDevtools />
        </LineChart>
    );
}
