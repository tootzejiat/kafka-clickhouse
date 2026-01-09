import { useState } from 'react'
import './App.css'
import Chart from './components/Chart'
import { dbClient } from './client'
import { ChartType, EngagementRatio, GeographyMonthlyUserData, HourlyActivityData, StatusMonthlyUserData } from './types'
import LiveChart from './components/LiveChart'
import useStreaming from './hooks/useStreaming'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { NavLink } from 'react-router'
import EngagementRatioChart from './components/EngagementRatioChart'
import HourlyActivityChart from './components/HourlyActivityChart'

function App() {
    const [data, setData] = useState<StatusMonthlyUserData[] | GeographyMonthlyUserData[]>([])
    const [chartType, setChartType] = useState<{ name: string, code: ChartType }>({ name: "By Geography", code: "geography" })
    const [isPolling, setIsPollling] = useState<boolean>(false)
    const [engagementRatio, setEngagementRatio] = useState<EngagementRatio[]>();
    const [hourlyActivity, setHourlyActivity] = useState<HourlyActivityData[]>();
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

    const getPostEngagementRatio = async () => {

        await dbClient.command({
            query: `SYSTEM RELOAD DICTIONARY comments_count_dict;`
        })

        const resultSet = await dbClient.query({
            query: `SELECT 
                        category,
                        anyIf(post_id, rank_in_category = 1) AS rank_one_id,
                        anyIf(title, rank_in_category = 1) AS rank_one_title,
                        maxIf(ratio, rank_in_category = 1) AS rank_one_ratio,

                        anyIf(post_id, rank_in_category = 2) AS rank_two_id,
                        anyIf(title, rank_in_category = 2) AS rank_two_title,
                        maxIf(ratio, rank_in_category = 2) AS rank_two_ratio,

                        anyIf(post_id, rank_in_category = 3) AS rank_three_id,
                        anyIf(title, rank_in_category = 3) AS rank_three_title,
                        maxIf(ratio, rank_in_category = 3) AS rank_three_ratio
                    FROM (
                        SELECT 
                            p.post_id,
                            p.title,
                            p.category,
                            p.created_at,
                            dictGet('users_dict', 'username', p.user_id) AS username,
                            dictGet('comments_count_dict', 'comment_count', p.post_id) AS total_comments,
                            if(p.view_count > 0, (total_comments / p.view_count) * 100, 0) AS ratio,
                            row_number() OVER (
                                PARTITION BY p.category
                                ORDER BY ratio DESC, total_comments DESC
                            ) AS rank_in_category
                        FROM posts AS p
                    )
                    WHERE rank_in_category <= 3
                    GROUP BY category
                    ORDER BY category ASC;`,
            format: 'JSONEachRow',
        });

        const postEngagementRatio: EngagementRatio[] = await resultSet.json();

        console.log(postEngagementRatio)

        setEngagementRatio(postEngagementRatio)

    }

    const getHourlyActivity = async () => {
        const resultSet = await dbClient.query({
            query: `
                    SELECT 
                        toHour(toStartOfHour(created_at)) as hour,
                        round(avg(if(view_count > 0, (dictGet('comments_count_dict', 'comment_count', post_id) / view_count) * 100, 0)), 2) AS avg_ratio_per_hour
                    FROM posts
                    GROUP BY hour
                    ORDER BY hour ASC
                    WITH FILL FROM 0 TO 24 STEP 1;
                    `,
            format: 'JSONEachRow',
        });

        const hourlyActivityData: HourlyActivityData[] = await resultSet.json();

        console.log(hourlyActivity)
        setHourlyActivity(hourlyActivityData)
    }

    console.log('page refreshed')
    return (
        <div className='container'>
            <nav className='navigation'>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/posts">Posts</NavLink>
            </nav>

            <Button onClick={async () => { await getHourlyActivity() }} label='test' />
            <Button label='Get Monthly Signed Up User Count' onClick={async () => { await getMonthlyUser(chartType.code) }} />
            <label htmlFor="charts"> Chart Type</label>
            <Dropdown options={dropdownOptions} optionLabel='name' value={chartType} onChange={(e) => { setChartType(e.value) }} id="charts" />
            <Chart data={data} type={chartType.code} />

            <Button onClick={async () => { await startLiveSimulation() }}>Start Live Chart Simulation</Button>
            <Button onClick={async () => { await stopLiveSimulation() }}>Stop Live Chart Simulation</Button>
            <LiveChart polling={isPolling} />

            <EngagementRatioChart data={engagementRatio} />
            <Button onClick={async () => { await getPostEngagementRatio() }} label='Get Top Post Engagement Ratio By Category' />

            <HourlyActivityChart data={hourlyActivity} />
            <Button onClick={async () => { await getHourlyActivity() }} label='Get Hourly Post Engagement Activity' />
        </div>
    )
}

export default App
