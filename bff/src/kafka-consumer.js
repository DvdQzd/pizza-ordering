const { Kafka } = require('kafkajs');
const { io } = require('socket.io-client');

console.log('🎧 Starting BFF Kafka Consumer for order.completed...');

const kafka = new Kafka({
  clientId: 'bff-completion-consumer',
  brokers: ['kafka:29092']
});

const consumer = kafka.consumer({ groupId: 'bff-completion-group' });

// Connect to the BFF WebSocket server using Docker service name
const socket = io('http://bff:3000');

socket.on('connect', () => {
  console.log('🔌 Connected to BFF WebSocket server');
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from BFF WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection error:', error.message);
});

async function run() {
  try {
    await consumer.connect();
    console.log('✅ Connected to Kafka');

    await consumer.subscribe({ topic: 'order.completed' });
    console.log('✅ Subscribed to order.completed topic');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log('🎉 [BFF Consumer] Received order completion:');
        console.log(`   Topic: ${topic}`);
        console.log(`   Partition: ${partition}`);
        console.log(`   Offset: ${message.offset}`);
        console.log(`   Data: ${message.value.toString()}`);

        try {
          const completionData = JSON.parse(message.value.toString());
          
          const orderUpdate = {
            orderId: completionData.orderId,
            status: 'completed',
            message: `Order ${completionData.orderId} is ready! 🍕`,
            processedAt: completionData.processedAt,
            quantity: completionData.originalQuantity,
            timestamp: new Date().toISOString(),
          };

          // Emit to the BFF WebSocket server which will broadcast to all clients
          socket.emit('order-completed', orderUpdate);
          console.log('📡 [BFF Consumer] Sent completion notification to BFF WebSocket server');
          console.log(`   Order Update: ${JSON.stringify(orderUpdate, null, 2)}`);

        } catch (parseError) {
          console.error('❌ [BFF Consumer] Error parsing completion message:', parseError);
        }
      },
    });

    console.log('🚀 BFF Kafka Consumer is ready to handle order completions!');
  } catch (error) {
    console.error('❌ [BFF Consumer] Error:', error);
  }
}

run().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 [BFF Consumer] Shutting down gracefully...');
  socket.disconnect();
  await consumer.disconnect();
  process.exit(0);
}); 