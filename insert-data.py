import json
import uuid
import random
from datetime import date, timedelta
from confluent_kafka import Producer
from faker import Faker

fake = Faker()

# Kafka configuration optimized for high throughput
conf = {
    "bootstrap.servers": "broker:9092",
    "client.id": "python-stress-tester",
    "queue.buffering.max.messages": 1000000,
    "linger.ms": 100,  # Wait 100ms to batch messages together
    "batch.size": 65536,  # 64KB batches
}

producer = Producer(conf)


def generate_user(uid):
    """Generates a single randomized user dictionary."""
    # Randomize signup date within the last year
    random_date = date.today() - timedelta(days=random.randint(0, 365))

    return {
        "user_id": uid,
        "username": fake.user_name(),
        "email": fake.email(),
        "status": random.choice(["active", "inactive", "banned"]),
        "country_code": fake.country_code(),
        "signup_date": str(random_date),
    }


def run_load_test(total_rows=500000):
    print(f"🚀 Starting ingestion of {total_rows} rows...")

    for i in range(total_rows):
        user_data = generate_user(uuid.uuid4().int >> 64)

        # Produce message (asynchronous)
        producer.produce(
            "user_registrations",
            key=str(user_data["user_id"]).encode("utf-8"),
            value=json.dumps(user_data).encode("utf-8"),
        )

        # Periodically serve delivery callbacks to prevent buffer overflow
        if i % 10000 == 0:
            producer.poll(0)
            print(f"📝 Queued {i} rows...")

    print("⏳ Finalizing transmission (flushing)...")
    producer.flush()
    print("✨ Finished! All data sent to Kafka.")


if __name__ == "__main__":
    run_load_test()
