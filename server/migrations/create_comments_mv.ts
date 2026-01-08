import { dbClient } from "../dbClient";

export const runCreateCommentsMV = async () => {
    try {
        await dbClient.command({
            query: `
            CREATE MATERIALIZED VIEW IF NOT EXISTS comments_mv TO comments AS
            SELECT post_id, user_id, comment_text, upvotes 
            FROM kafka_comments_queue;
            `
        });
    } catch (error) {
        console.log(error)
    }
}
