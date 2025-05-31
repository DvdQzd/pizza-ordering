import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class OrderProcessor implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  async onModuleInit() {
    console.log('🔧 Initializing OrderProcessor...');
    
    this.kafka = new Kafka({
      clientId: 'pizza-processor-nestjs',
      brokers: ['kafka:29092'],
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ 
      groupId: 'pizza-processor-group-nestjs',
      allowAutoTopicCreation: true,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
    
    try {
      // Connect producer
      await this.producer.connect();
      console.log('✅ Kafka Producer connected successfully!');

      // Connect consumer
      await this.consumer.connect();
      console.log('✅ Kafka Consumer connected successfully!');

      // Subscribe to topic
      await this.consumer.subscribe({ 
        topics: ['pizza.orders'],
        fromBeginning: false 
      });
      console.log('✅ Subscribed to pizza.orders topic');

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          await this.processOrder(topic, partition, message);
        },
      });
      console.log('🚀 Pizza Backend Processor is ready to process orders!');

    } catch (error) {
      console.error('❌ Failed to initialize Kafka:', error);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        console.log('🔌 Kafka Consumer disconnected');
      }
      if (this.producer) {
        await this.producer.disconnect();
        console.log('🔌 Kafka Producer disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from Kafka:', error);
    }
  }

  private async processOrder(topic: string, partition: number, message: any) {
    const data = JSON.parse(message.value.toString());
    const { orderId, quantity, timestamp } = data;

    console.log('=== RECEIVED PIZZA ORDER ===');
    console.log(`Topic: ${topic}`);
    console.log(`Partition: ${partition}`);
    console.log(`Offset: ${message.offset}`);
    console.log(`Data: ${JSON.stringify(data)}`);
    console.log('============================');

    console.log(`🍕 Processing order ${orderId}...`);
    console.log(`   📦 Quantity: ${quantity} pizzas`);
    console.log(`   ⏱️  Processing time: ${quantity} pizzas × 2 seconds = ${quantity * 2} seconds total`);

    // Processing time: 2 seconds per pizza
    const processingTimeMs = quantity * 2000;
    await this.sleep(processingTimeMs);

    // Send completion message to order.completed topic
    const completionMessage = {
      orderId: orderId,
      status: 'completed',
      processedAt: new Date().toISOString(),
      originalQuantity: quantity
    };

    try {
      await this.producer.send({
        topic: 'order.completed',
        messages: [
          {
            key: orderId,
            value: JSON.stringify(completionMessage)
          }
        ]
      });

      console.log('✅ Order completed and sent to order.completed topic:');
      console.log(`   ${JSON.stringify(completionMessage)}`);
      console.log('🎉 Cycle completed!');
    } catch (error) {
      console.error('❌ Failed to send completion message:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 