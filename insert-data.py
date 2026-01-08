import json
import uuid
import random
from datetime import datetime
from confluent_kafka import Producer
from faker import Faker

fake = Faker()

conf = {
    "bootstrap.servers": "broker:9092",
    "client.id": "python-stress-tester",
    "queue.buffering.max.messages": 1000000,
    "linger.ms": 100,
    "batch.size": 65536,
}

producer = Producer(conf)

# To store IDs for relationships
user_ids = []
post_ids = []


def produce_message(topic, data):
    producer.produce(
        topic,
        key=str(data.get("post_id", data.get("user_id"))).encode("utf-8"),
        value=json.dumps(data).encode("utf-8"),
    )


def run_complex_load_test(user_count=300000, comments_per_post=3):
    print(f"🚀 Starting ingestion: {user_count} users...")

    # 1. Generate Users and Posts simultaneously
    for i in range(user_count):
        uid = str(uuid.uuid4())
        user_ids.append(uid)

        user_data = {
            "user_id": uid,
            "username": fake.user_name(),
            "email": fake.email(),
            "status": random.choice(["active", "inactive", "banned"]),
            "country_code": fake.country_code(),
            "signup_date": str(fake.date_this_year()),
        }
        produce_message("user_registrations", user_data)

        # TRIGGER: Every 4th user creates a post
        if (i + 1) % 4 == 0:
            pid = str(uuid.uuid4())
            post_ids.append(pid)
            post_data = {
                "post_id": pid,
                "user_id": uid,
                "title": fake.sentence(),
                "body": fake.paragraph(nb_sentences=5),
                "category": random.choice(
                    ["Technology", "Health", "Finance", "Education", "Travel"]
                ),
                "view_count": random.randint(0, 5000),
            }
            produce_message("user_posts", post_data)

        if i % 10000 == 0:
            producer.poll(0)
            print(f"📝 Processed {i} users...")

    print(f"✅ Generated {len(post_ids)} posts from {user_count} users.")
    print(f"💬 Generating {len(post_ids) * comments_per_post} comments...")

    # 2. Generate Comments (linked to existing posts and users)
    for i in range(len(post_ids) * comments_per_post):
        comment_data = {
            "post_id": random.choice(post_ids),
            "user_id": random.choice(user_ids),
            "comment_text": fake.sentence(),
            "upvotes": random.randint(0, 100),
        }
        produce_message("user_comments", comment_data)

        if i % 10000 == 0:
            producer.poll(0)

    print("⏳ Flushing to Kafka...")
    producer.flush()
    print("✨ Finished!")


if __name__ == "__main__":
    run_complex_load_test()
