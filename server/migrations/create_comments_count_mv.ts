import { dbClient } from "../dbClient";

export const runCreateCommentsCountTable = async () => {
    try {
        await dbClient.command({
            query: `
            CREATE MATERIALIZED VIEW IF NOT EXISTS comments_count_mv
            TO comments_count AS
            SELECT 
                post_id,
                1 AS comment_count
            FROM comments
            WHERE is_deleted=0
            GROUP BY (post_id);
            `
        });
    } catch (error) {
        console.log(error)
    }
}
