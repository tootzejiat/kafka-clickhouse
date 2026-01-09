import { CartesianGrid, LabelList, Legend, Line, LineChart, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';
import { ChartType, GeographyMonthlyUserData, StatusMonthlyUserData } from '../types';


export default function Chart({ data, type }: { data: GeographyMonthlyUserData[] | StatusMonthlyUserData[], type: ChartType }) {
    const minWidthPerPoint = 100;
    return (
        <>
            {
                type === 'geography' ?
                    <div className='chart-container'>
                        <ScatterChart
                            style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618, overflow: 'scroll', }}
                            responsive
                            margin={{
                                top: 20,
                                right: 20,
                                bottom: 0,
                                left: 20,
                            }}
                        >
                            <CartesianGrid />
                            <XAxis dataKey="country_code" />
                            <YAxis label={{ value: "No of Users", angle: -90 }} dataKey="count" width="auto" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter data={data} fill="#8884d8" activeShape={{ fill: 'green' }}>
                                <LabelList dataKey="count" fill="white" />
                            </Scatter>
                            <ZAxis dataKey="count" range={[400, 7000]} />
                            <RechartsDevtools />
                        </ScatterChart>
                    </div>
                    :
                    <div className='chart-container'>
                        <LineChart
                            style={{ width: '100%', aspectRatio: 1.3, overflow: 'scroll', }}
                            responsive
                            data={data}
                            margin={{
                                top: 20,
                                right: 20,
                                bottom: 0,
                                left: 0,
                            }}
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
                    </div>

            }
        </>
    );
}
