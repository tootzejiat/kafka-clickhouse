import { dbClient } from "../dbClient";

export const runCreateCommentsTable = async () => {
    try {
        await dbClient.command({
            query: `
                CREATE TABLE IF NOT EXISTS comments (
                    comment_id UUID DEFAULT generateUUIDv4(),
                    post_id UUID,
                    user_id UUID,
                    comment_text String,
                    upvotes UInt32,
                    created_at DateTime DEFAULT now(), 
                    is_deleted UInt8 DEFAULT 0
                ) ENGINE = MergeTree()
                PARTITION BY toYYYYMM(created_at)
                ORDER BY (post_id, created_at);
            `,
        })
    } catch (e) {
        console.log(e)
    }
}

export const runCreateKafkaCommentsQueue = async () => {
    try {
        await dbClient.command({
            query: `
            CREATE TABLE IF NOT EXISTS kafka_comments_queue (
                post_id UUID,
                user_id UUID,
                comment_text String,
                upvotes UInt32
            ) 
            ENGINE = Kafka()
            SETTINGS
                kafka_broker_list = 'broker:9092',
                kafka_topic_list = 'user_comments',
                kafka_group_name = 'clickhouse_consumer_group',
                kafka_format = 'JSONEachRow',
                kafka_num_consumers = 1;
            `,
        })
    } catch (e) {
        console.log(e)
    }
}


export const dropCommentsTable = async () => {
    try {
        await dbClient.command({
            query: `DROP TABLE comments`
        })

        await dbClient.command({
            query: `DROP TABLE kafka_comments_queue`
        })
    } catch (error) {
        console.log(error)
    }
}
