import { useState } from 'react'
import './App.css'
import Chart from './components/Chart'
import { dbClient } from './client'
import { ChartType, GeographyMonthlyUserData, StatusMonthlyUserData } from './types'
import LiveChart from './components/LiveChart'
import useStreaming from './hooks/useStreaming'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'

function App() {
    const [data, setData] = useState<StatusMonthlyUserData[] | GeographyMonthlyUserData[]>([])
    const [chartType, setChartType] = useState<{ name: string, code: ChartType }>({ name: "By Geography", code: "geography" })
    const [isPolling, setIsPollling] = useState<boolean>(false)
    const { simulateStreamingData, endSimulation } = useStreaming();

    const dropdownOptions = [{ name: "By Geography", code: "geography" }, { name: "By Status", code: "status" }]

    const getMonthlyUser = async (type: ChartType) => {
        try {
            let resultSet;
            if (type == 'status') {
                resultSet = await dbClient.query({
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

                const monthlyUserData: StatusMonthlyUserData[] = await resultSet.json();

                console.log(monthlyUserData)

                setData(monthlyUserData)
            } else {
                resultSet = await dbClient.query({
                    query: `SELECT 
                        count() as count,
                        country_code
                        FROM users
                        GROUP BY country_code;
                    `,
                    format: 'JSONEachRow',
                });

                const monthlyUserData: GeographyMonthlyUserData[] = await resultSet.json();

                console.log(monthlyUserData)

                setData(monthlyUserData)

            }

        } catch (error) {

            console.log(error)
        }
    }

    const startLiveSimulation = async () => {
        simulateStreamingData()
        setIsPollling(true)
    }

    const stopLiveSimulation = async () => {
        endSimulation()
        setIsPollling(false)
        alert("Simulation Stopped")
    }

    console.log('page refreshed')
    return (
        <div className='container'>
            <Button label='Get Monthly Signed Up User Count' onClick={async () => { await getMonthlyUser(chartType.code) }} />
            <label htmlFor="charts"> Chart Type</label>
            <Dropdown options={dropdownOptions} optionLabel='name' value={chartType} onChange={(e) => { setChartType(e.value) }} id="charts" />
            <Chart data={data} type={chartType.code} />

            <Button onClick={async () => { await startLiveSimulation() }}>Start Live Chart Simulation</Button>
            <Button onClick={async () => { await stopLiveSimulation() }}>Stop Live Chart Simulation</Button>
            <LiveChart polling={isPolling} />

        </div>
    )
}

export default App
