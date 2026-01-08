import { dbClient } from "../dbClient";

export const runCreatePostsEngagementRatioTable = async () => {
    try {
        await dbClient.command({
            query: `
                CREATE TABLE IF NOT EXISTS posts_engagement_ratio (
                    post_id UUID,
                    ratio UInt32
                ) ENGINE = AggregatingMergeTree()
                ORDER BY (ratio);
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
