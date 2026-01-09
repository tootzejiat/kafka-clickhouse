import { dbClient } from "../dbClient";

export const runCommentsCountDict = async () => {
    try {
        await dbClient.command({
            query: `
                CREATE DICTIONARY IF NOT EXISTS comments_count_dict (
                    post_id UUID,
                    comment_count UInt64
                )
                PRIMARY KEY post_id
                SOURCE(CLICKHOUSE(
                    USER 'ttj'
                    PASSWORD 'ttj123'
                    DB 'kafka_clickhouse'
                    HOST 'localhost'
                    PORT 9000
                    QUERY 'SELECT post_id, sum(comment_count) FROM kafka_clickhouse.comments_count GROUP BY post_id'
                ))
                LAYOUT(HASHED())
                LIFETIME(MIN 300 MAX 600);
            `
        });
    } catch (error) {
        console.log(error)
    }
}
