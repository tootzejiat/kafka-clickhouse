import { createClient } from '@clickhouse/client-web'

console.log(import.meta.env.VITE_CLICKHOUSE_USER)
export const dbClient = createClient({
    url: import.meta.env.VITE_CLICKHOUSE_HOST ?? 'http://localhost:8123',
    username: import.meta.env.VITE_CLICKHOUSE_USER ?? 'default',
    password: import.meta.env.VITE_CLICKHOUSE_PASSWORD ?? '',
    database: import.meta.env.VITE_CLICKHOUSE_DB ?? 'my_database'
})
