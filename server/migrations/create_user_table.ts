import { dbClient } from "../dbClient";

export const runCreateUserTable = async () => {
    try {
        await dbClient.command({
            query: `
                CREATE TABLE IF NOT EXISTS users (
                    user_id UUID DEFAULT generateUUIDv4(),
                    username String,
                    email String,
                    status Enum8('active' = 1, 'inactive' = 2, 'banned' = 3),
                    country_code LowCardinality(String),
                    signup_date Date,
                    created_at DateTime DEFAULT now()
                ) 
                ENGINE = MergeTree()
                ORDER BY (signup_date, user_id);
            `,
        })
    } catch (e) {
        console.log(e)
    }
}

export const runCreateKafkaUserQueue = async () => {
    try {
        await dbClient.command({
            query: `
            CREATE TABLE IF NOT EXISTS kafka_users_queue (
                username String,
                email String,
                status Enum8('active' = 1, 'inactive' = 2, 'banned' = 3),
                country_code LowCardinality(String),
                signup_date Date,
            ) 
            ENGINE = Kafka()
            SETTINGS
                kafka_broker_list = 'broker:9092',
                kafka_topic_list = 'user_registrations',
                kafka_group_name = 'clickhouse_consumer_group',
                kafka_format = 'JSONEachRow',
                kafka_num_consumers = 1;
            `,
        })
    } catch (e) {
        console.log(e)
    }
}

export const dropUserTable = async () => {
    try {
        await dbClient.command({
            query: `DROP TABLE users`
        })
        await dbClient.command({
            query: `DROP TABLE kafka_users_queue`
        })
    } catch (error) {
        console.log(error)
    }
}
