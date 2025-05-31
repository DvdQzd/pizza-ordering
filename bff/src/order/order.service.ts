import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {
    console.log('[OrderService] Initialized');
  }

  async onModuleInit() {
    console.log('[OrderService] Connecting to Kafka...');
    try {
      await this.kafkaClient.connect();
      console.log('[OrderService] Successfully connected to Kafka');
    } catch (error) {
      console.error('[OrderService] Failed to connect to Kafka:', error);
      throw error;
    }
  }

  async createOrder(quantity: number) {
    const orderId = uuidv4();
    const timestamp = new Date().toISOString();

    console.log(`[OrderService] Creating order ${orderId} for ${quantity} pizzas at ${timestamp}`);

    const orderEvent = {
      orderId,
      quantity,
      timestamp,
    };

    try {
      // Emit event to Kafka
      console.log('[OrderService] Sending event to Kafka:', JSON.stringify(orderEvent, null, 2));
      await this.kafkaClient.emit('pizza.orders', orderEvent);
      console.log(`[OrderService] Order ${orderId} successfully sent to Kafka topic 'pizza.orders'`);

      return {
        orderId,
        message: 'Order received and being processed',
        timestamp,
      };
    } catch (error) {
      console.error('[OrderService] Failed to send order to Kafka:', error);
      throw error;
    }
  }
} 