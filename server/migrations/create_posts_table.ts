import { dbClient } from "../dbClient";

export const runCreatePostsTable = async () => {
    try {
        await dbClient.command({
            query: `
                CREATE TABLE IF NOT EXISTS posts (
                    post_id UUID DEFAULT generateUUIDv4(),
                    user_id UUID,
                    title String,
                    body String,
                    category LowCardinality(String), 
                    view_count UInt32,
                    created_at DateTime DEFAULT now(),
                    is_published UInt8 DEFAULT 1
                ) ENGINE = MergeTree()
                PARTITION BY toYYYYMM(created_at)
                ORDER BY (category, created_at, post_id);
            `,
        })
    } catch (e) {
        console.log(e)
    }
}

export const runCreateKafkaPostsQueue = async () => {
    try {
        await dbClient.command({
            query: `
            CREATE TABLE IF NOT EXISTS kafka_posts_queue (
                user_id UUID,
                title String,
                body String,
                category LowCardinality(String), 
                view_count UInt32
            ) 
            ENGINE = Kafka()
            SETTINGS
                kafka_broker_list = 'broker:9092',
                kafka_topic_list = 'user_posts',
                kafka_group_name = 'clickhouse_consumer_group',
                kafka_format = 'JSONEachRow',
                kafka_num_consumers = 1;
            `,
        })
    } catch (e) {
        console.log(e)
    }
}

export const dropPostsTable = async () => {
    try {
        await dbClient.command({
            query: `DROP TABLE posts`
        })

        await dbClient.command({
            query: `DROP TABLE kafka_posts_queue`
        })
    } catch (error) {
        console.log(error)
    }
}
