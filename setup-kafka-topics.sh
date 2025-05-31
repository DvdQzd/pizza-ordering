#!/bin/bash

# 🍕 Pizza Ordering System - Kafka Topics Setup for Scaling
# ========================================================

echo "🔧 Setting up Kafka topics for scaling demo..."

# Wait for Kafka to be ready
echo "⏳ Waiting for Kafka to be ready..."
until docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --list &>/dev/null; do
    echo "   Waiting for Kafka..."
    sleep 2
done

echo "✅ Kafka is ready!"

# Configure pizza.orders topic with multiple partitions
echo "📊 Configuring pizza.orders topic with 3 partitions..."
docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --alter --topic pizza.orders --partitions 3 2>/dev/null || \
docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --create --topic pizza.orders --partitions 3 --replication-factor 1

# Configure order.completed topic with multiple partitions
echo "📊 Configuring order.completed topic with 3 partitions..."
docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --alter --topic order.completed --partitions 3 2>/dev/null || \
docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --create --topic order.completed --partitions 3 --replication-factor 1

# Show topic configurations
echo ""
echo "📋 Current topic configurations:"
docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --describe --topic pizza.orders
docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --describe --topic order.completed

echo ""
echo "🎉 Kafka topics configured for scaling!"
echo "📝 Now you can scale processors and they will work in parallel:"
echo "   docker-compose scale backend-processor=3" 