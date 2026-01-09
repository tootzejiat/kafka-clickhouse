import { dbClient } from "../dbClient";

export const runCreatePostsEngagementRatioTable = async () => {
    try {
        await dbClient.command({
            query: `
                CREATE TABLE IF NOT EXISTS posts_engagement_ratio (
                    hour DateTime,
                    avg_ratio_per_hour AggregateFunction(avg, UInt64)
                ) ENGINE = AggregatingMergeTree()
                ORDER BY (hour);
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
