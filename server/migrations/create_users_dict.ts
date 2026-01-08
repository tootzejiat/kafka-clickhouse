import { dbClient } from "../dbClient";

export const runCreateUsersDict = async () => {
    try {
        await dbClient.command({
            query: `
                CREATE DICTIONARY IF NOT EXISTS users_dict (
                    user_id UUID,
                    username String,
                    country_code String
                )
                PRIMARY KEY user_id
                SOURCE(CLICKHOUSE(
                    TABLE 'users'
                    USER 'ttj'
                    PASSWORD 'ttj123'
                    DB 'kafka_clickhouse'
                    HOST 'localhost'
                    PORT 9000
                ))
                LAYOUT(HASHED())
                LIFETIME(MIN 300 MAX 600);
            `
        });
    } catch (error) {
        console.log(error)
    }
}
