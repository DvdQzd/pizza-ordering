import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class OrderProcessor implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private processorId: string;

  async onModuleInit() {
    // Get processor ID from environment or generate one
    this.processorId = process.env.PROCESSOR_ID || `processor-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔧 Initializing OrderProcessor [${this.processorId}]...`);
    
    this.kafka = new Kafka({
      clientId: `pizza-processor-nestjs-${this.processorId}`,
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
      console.log(`✅ [${this.processorId}] Kafka Producer connected successfully!`);

      // Connect consumer
      await this.consumer.connect();
      console.log(`✅ [${this.processorId}] Kafka Consumer connected successfully!`);

      // Subscribe to topic
      await this.consumer.subscribe({ 
        topics: ['pizza.orders'],
        fromBeginning: false 
      });
      console.log(`✅ [${this.processorId}] Subscribed to pizza.orders topic`);

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          await this.processOrder(topic, partition, message);
        },
      });
      console.log(`🚀 [${this.processorId}] Pizza Backend Processor is ready to process orders!`);

    } catch (error) {
      console.error(`❌ [${this.processorId}] Failed to initialize Kafka:`, error);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        console.log(`🔌 [${this.processorId}] Kafka Consumer disconnected`);
      }
      if (this.producer) {
        await this.producer.disconnect();
        console.log(`🔌 [${this.processorId}] Kafka Producer disconnected`);
      }
    } catch (error) {
      console.error(`❌ [${this.processorId}] Error disconnecting from Kafka:`, error);
    }
  }

  private async processOrder(topic: string, partition: number, message: any) {
    const data = JSON.parse(message.value.toString());
    const { orderId, quantity, timestamp } = data;

    console.log(`=== 🍕 [${this.processorId}] RECEIVED PIZZA ORDER ===`);
    console.log(`Topic: ${topic}`);
    console.log(`Partition: ${partition}`);
    console.log(`Offset: ${message.offset}`);
    console.log(`Data: ${JSON.stringify(data)}`);
    console.log(`Processor: ${this.processorId}`);
    console.log('=============================================');

    console.log(`🍕 [${this.processorId}] Processing order ${orderId}...`);
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
      originalQuantity: quantity,
      processedBy: this.processorId
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

      console.log(`✅ [${this.processorId}] Order completed and sent to order.completed topic:`);
      console.log(`   ${JSON.stringify(completionMessage)}`);
      console.log(`🎉 [${this.processorId}] Cycle completed!`);
    } catch (error) {
      console.error(`❌ [${this.processorId}] Failed to send completion message:`, error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 