import express from 'express';
import Kafka from "node-rdkafka";

const PORT = 3001;
const app = express();

app.use(express.json());

const stream = Kafka.Producer.createWriteStream({
    'metadata.broker.list': 'broker:9092'
}, {}, { topic: 'user_registrations' });

app.post('/api/simulate-user', (req, res) => {
    console.log("User Data:", req.body)
    const userData = req.body;
    const queuedSuccess = stream.write(Buffer.from(JSON.stringify(userData)));

    if (queuedSuccess) {
        res.status(200).send({ status: 'Queued' });
    } else {
        res.status(503).send({ error: 'Queue full' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Server running on port ${PORT}`);
});
