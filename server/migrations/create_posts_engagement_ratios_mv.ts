import { dbClient } from "../dbClient";

export const runCreatePostsEngagementRatioMV = async () => {
    try {
        await dbClient.command({
            query: `
            CREATE MATERIALIZED VIEW IF NOT EXISTS posts_engagement_ratio_mv
            TO posts_engagement_ratio AS
            SELECT 
                post_id,
                (view_count/
            FROM posts;
            `
        });
    } catch (error) {
        console.log(error)
    }
}
