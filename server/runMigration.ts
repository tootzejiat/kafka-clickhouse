import { dbClient } from "./dbClient";
import { runCommentsCountDict } from "./migrations/create_comments_count_dict";
import { runCreateCommentsCountMV } from "./migrations/create_comments_count_mv";
import { runCreateCommentsCountTable } from "./migrations/create_comments_count_table";
import { runCreateCommentsMV } from "./migrations/create_comments_mv";
import { dropCommentsTable, runCreateCommentsTable, runCreateKafkaCommentsQueue } from "./migrations/create_comments_table";
import { runCreateHourlyEngagementMV } from "./migrations/create_hourly_engagement_ratio_mv";
import { runCreateHourlyEngagementRatioTable } from "./migrations/create_hourly_engagement_ratio_table";
import { runCreatePostsMV } from "./migrations/create_posts_mv";
import { dropPostsTable, runCreateKafkaPostsQueue, runCreatePostsTable } from "./migrations/create_posts_table";
import { runCreateUserMV } from "./migrations/create_user_mv";
import { dropUserTable, runCreateKafkaUserQueue, runCreateUserTable } from "./migrations/create_user_table";
import { runCreateUsersDict } from "./migrations/create_users_dict";

const runMigrations = async () => {
    try {
        //Create user table
        await runCreateUserTable()
        await runCreateKafkaUserQueue()
        await runCreateUsersDict()

        //Create posts table
        await runCreatePostsTable()
        await runCreateKafkaPostsQueue()

        //Create comments table
        await runCreateCommentsTable()
        await runCreateKafkaCommentsQueue()
        await runCreateCommentsCountTable()
        await runCommentsCountDict()


        //Create user MV
        await runCreateUserMV()

        //Create posts MV
        await runCreatePostsMV()

        //Create comments MV
        await runCreateCommentsMV()
        await runCreateCommentsCountMV()


        //Create Post Engagement Table

        setTimeout(async () => {
            await runCreateHourlyEngagementRatioTable()
            await runCreateHourlyEngagementMV()
        }, 3000);

        const resultSet = await dbClient.query({
            query: 'SELECT count() FROM users;',
            format: 'JSONEachRow',
        });

        const tables = await resultSet.json();
        console.log(tables);

    } catch (error) {
        console.log(error)
        console.log("Migration Failed.")
    }
}

const dropMigrations = async () => {
    try {
        await dropUserTable()
        await dropCommentsTable()
        await dropPostsTable()

        return true
    } catch (error) {
        console.log(error)
        console.log('Drop failed')
    }
}

const runTest = async () => {

    const resultSet = await dbClient.query({
        query: `SELECT count() FROM users `,
        format: 'JSONEachRow', // Recommended for easy JS processing
    });

    const tables = await resultSet.json();
    console.log(tables);
}

// dropMigrations()

runMigrations().then((_var) => console.log(_var))
