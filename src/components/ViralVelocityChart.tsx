import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label
} from 'recharts';
import { ViralVelocityData } from '../types';

export const ViralVelocityChart = ({ data }: { data: ViralVelocityData[] | undefined }) => {
    return (
        <div style={{ width: '100%', maxWidth: '1000px', height: 400, borderRadius: '8px' }}>
            <ResponsiveContainer>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis
                        type="number"
                        dataKey="hours_since_posted"
                        name="Age"
                        unit="h"
                        reversed
                    >
                        <Label value="Hours Since Posted" offset={-10} position="insideBottom" />
                    </XAxis>

                    <YAxis
                        type="number"
                        dataKey="ratio"
                        name="Engagement"
                        unit="%"
                    >
                        <Label value="Engagement Ratio" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                    </YAxis>

                    <ZAxis type="number" range={[50, 50]} />

                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                    />

                    <Scatter
                        name="Posts"
                        data={data}
                        fill="#8884d8"
                        fillOpacity={0.6}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};
