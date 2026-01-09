import { RechartsDevtools } from "@recharts/devtools";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { EngagementRatio } from "../types";

const EngagementRatioChart = ({ data }: { data: EngagementRatio[] | undefined }) => {

    return (
        <BarChart
            style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
            responsive
            data={data}
            margin={{
                top: 25,
                right: 0,
                left: 0,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis label={{ value: 'Ratio %', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />

            <Bar dataKey="rank_one_ratio" name="Rank #1" fill="#FFD700" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rank_two_ratio" name="Rank #2" fill="#C0C0C0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rank_three_ratio" name="Rank #3" fill="#CD7F32" radius={[4, 4, 0, 0]} />
            <RechartsDevtools />
        </BarChart>
    );
};

export default EngagementRatioChart
