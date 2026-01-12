import { dbClient } from "../dbClient";

export const runCreateHourlyEngagementMV = async () => {
    try {
        await dbClient.command({
            query: `SYSTEM RELOAD DICTIONARY users_dict;`
        })

        await dbClient.command({
            query: `SYSTEM RELOAD DICTIONARY comments_count_dict;`
        })

        await dbClient.command({
            query: `
            CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_engagement_ratio_mv TO hourly_engagement_ratio AS
            SELECT 
                toHour(toStartOfHour(created_at)) as hour, 
                dictGet('users_dict', 'country_code', user_id) AS country_code,
                avgState(if(view_count > 0, (dictGet('comments_count_dict', 'comment_count', post_id) / view_count) * 100, 0)) AS avg_ratio_per_hour
            FROM posts
            GROUP BY hour, country_code;
            `
        });
    } catch (error) {
        console.log(error)
    }
}
