import { dbClient } from "../dbClient";

export const runCreateHourlyEngagementRatioTable = async () => {
    try {
        await dbClient.command({
            query: `
                CREATE TABLE IF NOT EXISTS hourly_engagement_ratio (
                    hour UInt8,
                    country_code LowCardinality(String),
                    avg_ratio_per_hour AggregateFunction(avg, Float64),
                ) ENGINE = AggregatingMergeTree()
                ORDER BY (country_code, hour);
            `,
        })
    } catch (e) {
        console.log(e)
    }
}

export const dropPostsTable = async () => {
    try {
        await dbClient.command({
            query: `DROP TABLE posts_engagement_ratio`
        })
    } catch (error) {
        console.log(error)
    }
}
