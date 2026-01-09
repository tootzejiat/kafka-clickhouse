import { dbClient } from "../dbClient";

export const runCreateCommentsCountMV = async () => {
    try {
        await dbClient.command({
            query: `
            CREATE MATERIALIZED VIEW IF NOT EXISTS comments_count_mv
            TO comments_count AS
            SELECT 
                post_id,
                1 AS comment_count
            FROM comments
            WHERE is_deleted=0 ;
            `
        });
    } catch (error) {
        console.log(error)
    }
}
