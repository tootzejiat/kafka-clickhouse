import { dbClient } from "../dbClient";

export const runCreateUserMV = async () => {
    try {
        await dbClient.command({
            query: `
                CREATE MATERIALIZED VIEW IF NOT EXISTS users_mv TO users AS
                SELECT * FROM kafka_users_queue;
                `
        })
    } catch (error) {
        console.log(error)
    }
}
