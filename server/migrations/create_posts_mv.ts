import { dbClient } from "../dbClient";

export const runCreatePostsMV = async () => {
    try {
        await dbClient.command({
            query: `
            CREATE MATERIALIZED VIEW IF NOT EXISTS posts_mv TO posts AS
            SELECT user_id, title, body, category, view_count
            FROM kafka_posts_queue;
            `
        });
    } catch (error) {
        console.log(error)
    }
}
