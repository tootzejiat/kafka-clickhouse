import { useState } from 'react'
import './App.css'
import Chart from './components/Chart'
import { dbClient } from './client'
import { ChartType, CommentData, GeographyMonthlyUserData, PostData, StatusMonthlyUserData } from './types'
import LiveChart from './components/LiveChart'
import useStreaming from './hooks/useStreaming'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import Post from './components/Post'
import Comment from './components/Comment'
import { Card } from 'primereact/card'
import { Panel } from 'primereact/panel'

const MOCK_POST: PostData = {
    post_id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "721e8400-e29b-41d4-a716-446655441111",
    title: "Learning ClickHouse Joins",
    body: "ClickHouse is incredibly fast for analytical queries. Today we are exploring how to join Posts and Comments...",
    category: "Technology",
    view_count: 1240,
    created_at: "2026-01-07T10:00:00Z"
};

const MOCK_COMMENTS: CommentData[] = [
    {
        comment_id: "c1-uuid",
        post_id: MOCK_POST.post_id,
        user_id: "user-abc-123",
        comment_text: "Great explanation! The Materialized View part was very helpful.",
        upvotes: 12,
        created_at: "2026-01-07T12:30:00Z",
        is_deleted: 0
    },
    {
        comment_id: "c2-uuid",
        post_id: MOCK_POST.post_id,
        user_id: "user-xyz-999",
        comment_text: "Can you explain the ASOF join more in the next post?",
        upvotes: 5,
        created_at: "2026-01-07T14:15:00Z",
        is_deleted: 0
    }
];

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


            <Panel>
                <Post data={MOCK_POST} />
                <h4>
                    Comments ({MOCK_COMMENTS.length})</h4>
                {MOCK_COMMENTS.map(c => <Comment key={c.comment_id} data={c} />)}
            </Panel>

        </div>
    )
}

export default App
