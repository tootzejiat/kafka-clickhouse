import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';
import { LiveData } from '../types';
import { useEffect, useState } from 'react';
import { dbClient } from '../client';

const LiveChart = ({ polling }: { polling: boolean }) => {
    const [liveData, setLiveData] = useState<LiveData[]>()
    const [liveInverval, setLiveInterval] = useState<NodeJS.Timeout>()

    const getLastHourRegisteredUsers = async () => {
        try {
            const resultSet = await dbClient.query({
                query: `
                    SELECT
                        toStartOfInterval(created_at, INTERVAL 1 SECOND) AS sec,
                        count() as count
                    FROM
                        users
                    WHERE
                        created_at >= now() - INTERVAL 1 MINUTE
                    GROUP BY sec
                    ORDER BY sec ASC;
                    `,
                format: 'JSONEachRow',
            });

            const usersFromLastHour: LiveData[] = await resultSet.json();

            console.log(usersFromLastHour)

            setLiveData(usersFromLastHour)
        } catch (error) {
            console.log(error)

        }

    }

    const startLiveSimulation = async () => {
        setLiveInterval(setInterval(getLastHourRegisteredUsers, 3000))
    }

    const stopLiveSimulation = async () => {
        clearInterval(liveInverval)
    }

    useEffect(() => {
        if (polling) {
            startLiveSimulation()
        } else {
            stopLiveSimulation()
        }
    }, [polling])

    return (
        <div className='chart-container'>
            <BarChart
                style={{ maxHeight: '70vh', aspectRatio: 1.618 }}
                responsive
                data={liveData}
                margin={{
                    top: 5,
                    right: 0,
                    left: 0,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={(data) => data.sec.split(" ")[1]} fontSize={10} />
                <YAxis width="auto" label={{ value: "No of Registered Users", angle: -90 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" activeBar={{ fill: 'pink', stroke: 'blue' }} radius={[10, 10, 0, 0]} />
                <RechartsDevtools />
            </BarChart>
        </div>
    );
};

export default LiveChart;
