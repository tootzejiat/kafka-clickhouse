import { useState } from 'react'
import './App.css'
import Chart from './components/Chart'
import { dbClient } from './client'
import { LiveData, MonthlyUserData } from './types'
import LiveChart from './components/LiveChart'
import useStreaming from './hooks/useStreaming'

function App() {
    const [data, setData] = useState<MonthlyUserData[]>([])
    const [liveData, setLiveData] = useState<LiveData[]>()
    const [liveInverval, setLiveInterval] = useState<NodeJS.Timeout>()
    const [insertInterval, setInsertInterval] = useState<NodeJS.Timeout>()
    const { simulateStreamingData } = useStreaming();

    const getMonthlyUser = async () => {
        console.log('running')
        try {
            const resultSet = await dbClient.query({
                query: `SELECT 
                    countIf(status = 'active') as active,
                    countIf(status = 'inactive') as inactive,
                    countIf(status = 'banned') as banned,
                    toMonth(toDate(signup_date)) as date
                    FROM users
                    GROUP BY date
                    ORDER BY date ASC;`,
                format: 'JSONEachRow',
            });

            const monthlyUserData: MonthlyUserData[] = await resultSet.json();

            console.log(monthlyUserData)

            setData(monthlyUserData)
        } catch (error) {

            console.log(error)
        }
    }

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
        setInsertInterval(setInterval(simulateStreamingData, 1500))
    }

    const stopLiveSimulation = async () => {
        clearInterval(liveInverval)
        clearInterval(insertInterval)
    }

    return (
        <div className='container'>
            <button onClick={async () => { await getMonthlyUser() }}>Get Monthly Signed Up User Count</button>
            <Chart data={data} />

            <button onClick={async () => { await startLiveSimulation() }}>Start Live Chart Streaming</button>
            <button onClick={async () => { await stopLiveSimulation() }}>Stop Live Chart Streaming</button>
            <LiveChart data={liveData} />
        </div>
    )
}

export default App
