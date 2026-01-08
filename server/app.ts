import { faker } from '@faker-js/faker';
import express from 'express';
import Kafka from "node-rdkafka";

const PORT = 3001;
const app = express();

app.use(express.json());

const stream = Kafka.Producer.createWriteStream({
    'metadata.broker.list': 'broker:9092'
}, {}, { topic: 'user_registrations' });

let streamingInterval: NodeJS.Timeout;

const sendToKafka = async () => {
    const userData = {
        username: faker.internet.username(),
        email: faker.internet.email(),
        status: faker.helpers.arrayElement(['active', 'inactive', 'banned']),
        country_code: faker.location.countryCode(),
        signup_date: new Date().toISOString().split('T')[0]
    };

    const queuedSuccess = stream.write(Buffer.from(JSON.stringify(userData)));

    return queuedSuccess
}


app.post('/api/simulate-user', (req, res) => {
    try {
        streamingInterval = setInterval(sendToKafka, 1000)
        console.log('Simulating Registration')
        res.status(200).json('Simulating Registration')
    } catch {
        res.status(500).json('Error')
    }
});

app.post('/api/end-simulation', (req, res) => {
    try {
        clearTimeout(streamingInterval)
        console.log('Ending Simulation')
        res.status(200).json('Ending Simulation')
    } catch (error) {
        res.status(500).json('Error')
    }
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Server running on port ${PORT}`);
});
