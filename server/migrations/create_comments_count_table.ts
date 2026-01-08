
import { dbClient } from "../dbClient";

export const runCreateCommentsCountTable = async () => {
    try {
        await dbClient.command({
            query: `
                CREATE TABLE IF NOT EXISTS comments_count (
                    post_id UUID,
                    comment_count UInt64
                ) ENGINE = SummingMergeTree()
                ORDER BY (post_id);
            `,
        })
    } catch (e) {
        console.log(e)
    }
}

export const dropPostsTable = async () => {
    try {
        await dbClient.command({
            query: `DROP TABLE comments_count`
        })
    } catch (error) {
        console.log(error)
    }
}
