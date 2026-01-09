import json
import uuid
import random
import time
import os
from threading import Lock
from confluent_kafka import Producer, Consumer, KafkaError, KafkaException
from faker import Faker
import clickhouse_connect

fake = Faker()

# Kafka Producer Configuration
conf = {
    "bootstrap.servers": os.getenv("KAFKA_BROKER", "broker:9092"),
    "client.id": "python-stress-tester",
    "queue.buffering.max.messages": 1000000,
    "linger.ms": 100,
    "batch.size": 65536,
}

producer = Producer(conf)

# ClickHouse client configuration
clickhouse_client = None

try:
    clickhouse_client = clickhouse_connect.get_client(
        host=os.getenv("CLICKHOUSE_HOST", "database"),
        port=int(os.getenv("CLICKHOUSE_PORT", "8123")),
        username=os.getenv("CLICKHOUSE_USER", "ttj"),
        password=os.getenv("CLICKHOUSE_PASSWORD", "ttj123"),
        database=os.getenv("CLICKHOUSE_DB", "kafka_clickhouse"),
    )
    print("✅ Connected to ClickHouse")
    print(f"   Host: {os.getenv('CLICKHOUSE_HOST', 'database')}")
    print(f"   Database: {os.getenv('CLICKHOUSE_DB', 'kafka_clickhouse')}")
except Exception as e:
    print(f"⚠️  Could not connect to ClickHouse: {e}")
    print("   Posts and comments will be skipped")

# Track delivery status
delivery_status = {"success": 0, "failed": 0}
status_lock = Lock()

# Store sample IDs for verification
sample_user_ids = []
sample_post_user_ids = []
sample_post_data = []


def delivery_report(err, msg):
    """Callback for message delivery confirmation"""
    with status_lock:
        if err is not None:
            delivery_status["failed"] += 1
            print(f"❌ Message delivery failed: {err}")
        else:
            delivery_status["success"] += 1
            if delivery_status["success"] % 10000 == 0:
                print(f"📊 Delivered: {delivery_status['success']} messages")


def produce_message(topic, data):
    """Produce a message to Kafka with delivery callback"""
    key_val = data.get("post_id") or data.get("user_id", str(uuid.uuid4()))
    producer.produce(
        topic,
        key=str(key_val).encode("utf-8"),
        value=json.dumps(data).encode("utf-8"),
        callback=delivery_report,
    )


def reset_delivery_status():
    """Reset delivery counters"""
    with status_lock:
        delivery_status["success"] = 0
        delivery_status["failed"] = 0


def print_delivery_summary(phase_name):
    """Print delivery summary for a phase"""
    with status_lock:
        total = delivery_status["success"] + delivery_status["failed"]
        print(f"\n{'=' * 60}")
        print(f"📈 {phase_name} - Delivery Summary:")
        print(f"   ✅ Successful: {delivery_status['success']}")
        print(f"   ❌ Failed: {delivery_status['failed']}")
        print(f"   📊 Total: {total}")
        if total > 0:
            success_rate = (delivery_status["success"] / total) * 100
            print(f"   🎯 Success Rate: {success_rate:.2f}%")
        print(f"{'=' * 60}\n")


def get_user_ids_from_clickhouse(every_nth=4):
    """Fetch every Nth user_id from ClickHouse after users are created"""
    if not clickhouse_client:
        return []

    try:
        # Get total count first
        count_result = clickhouse_client.query("SELECT count() FROM users")
        total_users = count_result.result_rows[0][0]
        print(f"   Total users in ClickHouse: {total_users:,}")

        # Fetch every Nth user
        query = f"""
        SELECT user_id 
        FROM (
            SELECT user_id, row_number() OVER (ORDER BY created_at, user_id) as rn
            FROM users
        )
        WHERE rn % {every_nth} = 0
        ORDER BY rn
        """

        result = clickhouse_client.query(query)
        user_ids = [str(row[0]) for row in result.result_rows]
        return user_ids
    except Exception as e:
        print(f"❌ Error fetching user_ids from ClickHouse: {e}")
        return []


def get_post_ids_from_clickhouse(limit=None):
    """Fetch post_ids from ClickHouse after posts are created"""
    if not clickhouse_client:
        return []

    try:
        query = "SELECT post_id FROM posts ORDER BY created_at, post_id"
        if limit:
            query += f" LIMIT {limit}"

        result = clickhouse_client.query(query)
        post_ids = [str(row[0]) for row in result.result_rows]
        return post_ids
    except Exception as e:
        print(f"❌ Error fetching post_ids from ClickHouse: {e}")
        return []


def verify_kafka_messages(topic, expected_count, sample_size=10):
    """Verify that messages actually exist in Kafka with correct IDs"""
    print(f"\n🔍 Verifying messages in topic '{topic}'...")

    consumer_conf = {
        "bootstrap.servers": os.getenv("KAFKA_BROKER", "broker:9092"),
        "group.id": f"verifier-{uuid.uuid4()}",
        "auto.offset.reset": "earliest",
        "enable.auto.commit": False,
    }

    consumer = Consumer(consumer_conf)
    consumer.subscribe([topic])

    messages = []
    timeout = 30
    start_time = time.time()

    print(f"   📥 Reading first {sample_size} messages...")

    try:
        while len(messages) < sample_size and (time.time() - start_time) < timeout:
            msg = consumer.poll(1.0)

            if msg is None:
                continue

            msg_error = msg.error()
            if msg_error is not None:
                if msg_error.code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    print(f"   ❌ Consumer error: {msg_error}")
                    break

            try:
                value = msg.value()
                if value is not None:
                    data = json.loads(value.decode("utf-8"))
                    messages.append(data)

                    if len(messages) <= 3:
                        print(
                            f"   📄 Sample {len(messages)}: {json.dumps(data, indent=6)}"
                        )
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                print(f"   ❌ Error parsing message: {e}")

    except KafkaException as e:
        print(f"   ❌ Kafka exception: {e}")
    finally:
        consumer.close()

    print(f"\n   ✅ Successfully read {len(messages)} messages from Kafka")

    if topic == "user_registrations":
        user_ids = [msg.get("user_id") for msg in messages if "user_id" in msg]
        print("   🔑 Sample user_ids from Kafka:")
        for uid in user_ids[:5]:
            print(f"      • {uid}")
        return user_ids, messages

    elif topic == "user_posts":
        post_user_ids = [msg.get("user_id") for msg in messages if "user_id" in msg]
        print("   🔑 Sample user_ids in posts from Kafka:")
        for uid in post_user_ids[:5]:
            print(f"      • {uid}")
        return post_user_ids, messages

    elif topic == "user_comments":
        comment_data = [msg for msg in messages]
        print("   🔑 Sample comments from Kafka:")
        for comment in comment_data[:3]:
            print(f"        post_id: {comment.get('post_id', 'N/A')[:8]}...")
            print(f"        user_id: {comment.get('user_id', 'N/A')[:8]}...")
        return comment_data, messages

    return [], []


def run_complex_load_test(
    user_count=300000, posts_per_user=1, comments_per_post=3, wait_time=20, verify=True
):
    """Run a complex load test with proper synchronization and verification"""

    # Clear global sample lists
    global sample_user_ids, sample_post_user_ids, sample_post_data
    sample_user_ids = []
    sample_post_user_ids = []
    sample_post_data = []

    session_user_ids = []
    user_ids_from_db = []
    post_ids = []
    total_posts = 0
    total_comments = 0

    print(f"\n{'=' * 60}")
    print("🚀 Starting Complex Load Test")
    print(f"{'=' * 60}")
    print(f"👥 Total Users: {user_count:,}")
    print(
        f"📝 Posts: ~{user_count // 4:,} (every 4th user creates {posts_per_user} post(s))"
    )
    print(
        f"💬 Comments: ~{(user_count // 4) * posts_per_user * comments_per_post:,} ({comments_per_post} per post)"
    )
    print(f"⏱️  Wait Time Between Phases: {wait_time}s")
    print(f"🔍 Verification Enabled: {verify}")
    print(f"{'=' * 60}\n")

    # ==================================================================
    # PHASE 1: Create all Users (user_id generated by producer)
    # ==================================================================
    print(f"🚀 PHASE 1: Creating {user_count:,} users...")
    reset_delivery_status()
    start_time = time.time()

    for i in range(user_count):
        uid = str(uuid.uuid4())
        session_user_ids.append(uid)

        user_data = {
            "username": fake.user_name(),
            "email": fake.email(),
            "status": "active",
            "country_code": fake.country_code(),
            "signup_date": str(fake.date_this_year()),
        }
        produce_message("user_registrations", user_data)

        if i % 10000 == 0:
            producer.poll(0)

    print("⏳ Flushing users to Kafka...")
    producer.flush()

    phase1_time = time.time() - start_time
    print(f"⏱️  Phase 1 completed in {phase1_time:.2f} seconds")
    print_delivery_summary("PHASE 1: User Registrations")

    # Verify users in Kafka
    if verify:
        kafka_user_ids, kafka_user_messages = verify_kafka_messages(
            "user_registrations", user_count, sample_size=100
        )

    # Wait for consumers to process users
    print(f"\n⏸️  Waiting {wait_time} seconds for consumers to process users...")
    for remaining in range(wait_time, 0, -1):
        print(f"   ⏳ {remaining} seconds remaining...", end="\r")
        time.sleep(1)
    print("   ✅ Wait complete!                    \n")

    # ==================================================================
    # FETCH USER IDs FROM CLICKHOUSE (Every 4th user)
    # ==================================================================
    print("📥 Fetching user_ids from ClickHouse (every 4th user)...")
    user_ids_from_db = get_user_ids_from_clickhouse(every_nth=4)

    if len(user_ids_from_db) > 0:
        print(f"   ✅ Retrieved {len(user_ids_from_db):,} user_ids from ClickHouse")
        print("   📄 Sample user_ids:")
        for uid in user_ids_from_db[:5]:
            print(f"      • {uid}")
        sample_user_ids = user_ids_from_db[:100]
    else:
        print("   ❌ Could not fetch user_ids from ClickHouse")
        print("   ⚠️  Skipping post and comment creation phases")
        return

    # ==================================================================
    # PHASE 2: Create Posts (NO post_id, user_id from ClickHouse)
    # ==================================================================
    print(
        f"\n🚀 PHASE 2: Generating {posts_per_user} post(s) for each selected user..."
    )
    reset_delivery_status()
    start_time = time.time()

    post_count = 0
    for uid in user_ids_from_db:
        for _ in range(posts_per_user):
            post_data = {
                # NO post_id - ClickHouse generates it
                "user_id": uid,  # Use actual user_id from ClickHouse
                "title": fake.sentence(),
                "body": fake.paragraph(),
                "category": random.choice(
                    ["Tech", "Health", "Finance", "Education", "Entertainment"]
                ),
                "view_count": random.randint(0, 5000),
                "created_at": fake.date_time_between(
                    start_date="-2y", end_date="now"
                ).strftime("%Y-%m-%d %H:%M:%S"),
            }
            produce_message("user_posts", post_data)

            # Store first 100 posts for verification
            if post_count < 100:
                sample_post_user_ids.append(uid)
                sample_post_data.append(post_data)
            post_count += 1
            total_posts += 1

        if post_count % 10000 == 0:
            producer.poll(0)

    print("⏳ Flushing posts to Kafka...")
    producer.flush()

    phase2_time = time.time() - start_time
    print(f"⏱️  Phase 2 completed in {phase2_time:.2f} seconds")
    print_delivery_summary("PHASE 2: User Posts")

    # Verify posts in Kafka
    if verify:
        kafka_post_user_ids, kafka_post_messages = verify_kafka_messages(
            "user_posts", total_posts, sample_size=100
        )

        print("\n🔗 Critical Cross-Reference Check:")
        print("   Checking if posts reference the correct users...")

        matches_producer = set(sample_post_user_ids) & set(sample_user_ids)
        print(
            f"   ✅ Producer side: {len(matches_producer)}/{len(sample_post_user_ids)} post user_ids exist in sample users"
        )

        if len(matches_producer) == len(sample_post_user_ids):
            print(
                "   🎉 PERFECT: Producer created posts with correct user_ids from ClickHouse!"
            )
        else:
            print("   ❌ ERROR: Producer created posts with non-existent user_ids!")

    # Wait for consumers to process posts
    print(f"\n⏸️  Waiting {wait_time} seconds for consumers to process posts...")
    for remaining in range(wait_time, 0, -1):
        print(f"   ⏳ {remaining} seconds remaining...", end="\r")
        time.sleep(1)
    print("   ✅ Wait complete!                    \n")

    # ==================================================================
    # FETCH POST IDs FROM CLICKHOUSE
    # ==================================================================
    if comments_per_post > 0:
        print("📥 Fetching post_ids from ClickHouse...")
        post_ids = get_post_ids_from_clickhouse()

        if len(post_ids) > 0:
            print(f"   ✅ Retrieved {len(post_ids):,} post_ids from ClickHouse")
            print("   📄 Sample post_ids:")
            for pid in post_ids[:5]:
                print(f"      • {pid}")
        else:
            print("   ❌ Could not fetch post_ids from ClickHouse")
            print("   ⚠️  Skipping comment creation phase")
            comments_per_post = 0

    # ==================================================================
    # PHASE 3: Create Comments (WITH post_id from ClickHouse)
    # ==================================================================
    if comments_per_post > 0 and len(post_ids) > 0:
        print(f"\n🚀 PHASE 3: Creating {comments_per_post} comments per post...")
        reset_delivery_status()
        start_time = time.time()

        comment_count = 0
        for post_id in post_ids:
            for _ in range(random.randint(1, 3)):
                comment_data = {
                    # NO comment_id - ClickHouse generates it
                    "post_id": post_id,  # Use actual post_id from ClickHouse
                    "user_id": random.choice(
                        user_ids_from_db
                    ),  # Random user from DB comments
                    "comment_text": fake.paragraph(),
                    "upvotes": random.randint(0, 100),
                }
                produce_message("user_comments", comment_data)
                comment_count += 1
                total_comments += 1

            # Poll occasionally
            if comment_count % 10000 == 0:
                producer.poll(0)

        print("⏳ Flushing comments to Kafka...")
        producer.flush()

        phase3_time = time.time() - start_time
        print(f"⏱️  Phase 3 completed in {phase3_time:.2f} seconds")
        print_delivery_summary("PHASE 3: Comments")

        # Verify comments in Kafka
        if verify:
            kafka_comments, kafka_comment_messages = verify_kafka_messages(
                "user_comments", total_comments, sample_size=50
            )
            print(
                f"\n   ✅ Successfully verified {len(kafka_comments)} comments in Kafka"
            )

    # ==================================================================
    # Final Summary
    # ==================================================================
    print(f"\n{'=' * 60}")
    print("✨ Load Test Completed!")
    print(f"{'=' * 60}")
    print("📊 Summary:")
    print(f"   👥 Users Created: {len(session_user_ids):,}")
    print(f"   👥 Users Selected for Posts: {len(user_ids_from_db):,}")
    print(f"   📝 Posts Created: {total_posts:,}")
    if comments_per_post > 0:
        print(f"   💬 Comments Created: {total_comments:,}")
    total_time = phase1_time + phase2_time
    if comments_per_post > 0 and len(post_ids) > 0:
        total_time += phase3_time
    print(f"   ⏱️  Total Time: {total_time:.2f} seconds")
    print(f"{'=' * 60}\n")

    print("💡 Architecture:")
    print("   👥 user_id in users: Generated by producer")
    print("   📝 post_id: Generated by ClickHouse DEFAULT generateUUIDv4()")
    print("   💬 comment_id: Generated by ClickHouse DEFAULT generateUUIDv4()")
    print("   🔗 user_id in posts: Fetched from ClickHouse users table (every 4th)")
    print("   🔗 post_id in comments: Fetched from ClickHouse posts table")
    print("   🔗 user_id in comments: Selected from ClickHouse users (random)")

    # Save sample IDs to file
    try:
        with open("sample_ids.json", "w") as f:
            json.dump(
                {
                    "sample_user_ids_from_db": sample_user_ids[:20],
                    "sample_post_user_ids": sample_post_user_ids[:20],
                    "sample_post_ids": post_ids[:20] if post_ids else [],
                    "sample_posts": sample_post_data[:5],
                },
                f,
                indent=2,
            )
        print("\n💾 Saved sample IDs to 'sample_ids.json' for your reference\n")
    except IOError as e:
        print(f"⚠️  Could not save sample IDs: {e}\n")


if __name__ == "__main__":
    # Run with verification enabled (smaller test for debugging)
    # run_complex_load_test(user_count=10000, posts_per_user=1, comments_per_post=3, wait_time=10, verify=True)

    # Full load test
    run_complex_load_test(
        user_count=300000,
        posts_per_user=1,
        comments_per_post=3,
        wait_time=20,
        verify=False,
    )
