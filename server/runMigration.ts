import { dbClient } from "./dbClient";
import { runCreateUserMV } from "./migrations/create_user_mv";
import { dropUserTable, runCreateKafkaUserQueue, runCreateUserTable } from "./migrations/create_user_table";

const runMigrations = async () => {
    try {
        //Create kafka user queue table
        await runCreateKafkaUserQueue()
        //Create user table
        await runCreateUserTable()
        //Create user MV
        await runCreateUserMV()

        const resultSet = await dbClient.query({
            query: 'SELECT count() FROM users;',
            format: 'JSONEachRow', // Recommended for easy JS processing
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

//temp
// dropMigrations()

runMigrations().then((_var) => console.log(_var))

// runTest()
