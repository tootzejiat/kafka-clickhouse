import { dbClient } from "./dbClient";
import { runCreateCommentsMV } from "./migrations/create_comments_mv";
import { dropCommentsTable, runCreateCommentsTable, runCreateKafkaCommentsQueue } from "./migrations/create_comments_table";
import { runCreatePostsMV } from "./migrations/create_posts_mv";
import { dropPostsTable, runCreateKafkaPostsQueue, runCreatePostsTable } from "./migrations/create_posts_table";
import { runCreateUserMV } from "./migrations/create_user_mv";
import { dropUserTable, runCreateKafkaUserQueue, runCreateUserTable } from "./migrations/create_user_table";

const runMigrations = async () => {
    try {
        //Create user table
        await runCreateUserTable()
        await runCreateKafkaUserQueue()

        //Create posts table
        await runCreatePostsTable()
        await runCreateKafkaPostsQueue()

        //Create comments table
        await runCreateCommentsTable()
        await runCreateKafkaCommentsQueue()

        //Create user MV
        await runCreateUserMV()

        //Create posts MV
        await runCreatePostsMV()

        //Create comments MV
        await runCreateCommentsMV()

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
